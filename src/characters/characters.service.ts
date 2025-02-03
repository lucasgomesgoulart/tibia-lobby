import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Character } from "../db/entities/Characters.entity";
import { User } from "../db/entities/User.entity";
import { World } from "../db/entities/World.entity";
import { OtServer } from "../db/entities/OtServer.entity";
import { CharacterDto } from "./character.dto";

@Injectable()
export class CharacterService {
    constructor(
        @InjectRepository(Character) 
        private readonly characterRepository: Repository<Character>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(World)
        private readonly worldRepository: Repository<World>,

        @InjectRepository(OtServer)
        private readonly otServerRepository: Repository<OtServer>,
    ) {}

    async createCharacter(characterDto: CharacterDto, userId: string): Promise<Character> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        let world = null;
        let otServer = null;

        if (characterDto.worldId) {
            world = await this.worldRepository.findOne({ where: { id: characterDto.worldId } });
            if (!world) throw new NotFoundException("Mundo não encontrado.");
        }

        if (characterDto.otServerId) {
            otServer = await this.otServerRepository.findOne({ where: { id: characterDto.otServerId } });
            if (!otServer) throw new NotFoundException("OTServer não encontrado.");
        }

        if (!world && !otServer) {
            throw new NotFoundException("Você precisa escolher um Mundo ou um OTServer.");
        }

        // 🔹 Agora estamos armazenando apenas os IDs e mantendo as relações
        const newCharacter = this.characterRepository.create({
            name: characterDto.name,
            serverType: characterDto.serverType,
            vocation: characterDto.vocation,
            user,
            world,
            otServer
        });

        return this.characterRepository.save(newCharacter);
    }

    async getUserCharacters(userId: string): Promise<Character[]> {
        return this.characterRepository.find({ 
            where: { user: { id: userId } }, 
            relations: ["world", "otServer"] 
        });
    }
}
