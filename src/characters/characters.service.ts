import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CharacterDto } from "./character.dto";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";


@Injectable()
export class CharacterService {
    constructor(
        @InjectRepository(Character) 
        private readonly characterRepository: Repository<Character>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async createCharacter(characterData: CharacterDto, userId: string): Promise<Character> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }
    
        const newCharacter = this.characterRepository.create({
            name: characterData.name,
            serverType: characterData.serverType,
            vocation: characterData.vocation,
            world: characterData.world ?? null,
            otServer: characterData.otServer ?? null,
            user: user 
        });

        return await this.characterRepository.save(newCharacter);
    }

    async getUserCharacters(userId: string): Promise<Character[]> {
        return await this.characterRepository.find({ 
            where: { user: { id: userId } }, 
            relations: ["user"], 
        });
    }
}
