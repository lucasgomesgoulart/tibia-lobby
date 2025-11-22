import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import axios from "axios";
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
        let vocation = characterDto.vocation;
        let level = characterDto.level;

    
        if (characterDto.serverType === "GLOBAL") {
            const tibiaData = await this.fetchTibiaCharacterData(characterDto.name);
            if (!tibiaData) {
                throw new NotFoundException("Personagem não encontrado na API TibiaData.");
            }
        
            // Busca o mundo correspondente no banco de dados
            const worldName = tibiaData.world;
            world = await this.worldRepository.findOne({ where: { name: worldName } });
        
            if (!world) {
                throw new NotFoundException(`Mundo "${worldName}" não encontrado no banco de dados.`);
            }
        
            // Normaliza a vocação recebida do TibiaData
            const vocationMap = {
                "Druid": "DRUID",
                "Sorcerer": "SORCERER",
                "Paladin": "PALADIN",
                "Knight": "KNIGHT",
                "Elder Druid": "DRUID",
                "Master Sorcerer": "SORCERER",
                "Royal Paladin": "PALADIN",
                "Elite Knight": "KNIGHT",
            };
        
            vocation = vocationMap[tibiaData.vocation] || null;
        
            if (!vocation) {
                throw new BadRequestException(`Vocação inválida retornada pela API: ${tibiaData.vocation}`);
            }
        
            level = tibiaData.level;
    
        }
    
        if (characterDto.serverType === "OTSERVER") {
            if (!characterDto.otServerId) {
                throw new BadRequestException("OTServer é obrigatório para personagens de OTServer.");
            }
    
            otServer = await this.otServerRepository.findOne({ where: { id: characterDto.otServerId } });
            if (!otServer) throw new NotFoundException("OTServer não encontrado.");
    
            if (!characterDto.vocation) {
                throw new BadRequestException("Vocação é obrigatória para personagens de OTServer.");
            }
            vocation = characterDto.vocation;
        }
    
        if (!world && !otServer) {
            throw new NotFoundException("Você precisa escolher um Mundo ou um OTServer.");
        }
    
        // Cria e salva o personagem no banco de dados
        const newCharacter = this.characterRepository.create({
            name: characterDto.name,
            serverType: characterDto.serverType,
            vocation,
            user,
            world,
            otServer,
            level,
        });
    
      
        return await this.characterRepository.save(newCharacter);
    }
    
    async fetchTibiaCharacterData(name: string) {
        try {
            const trimmed = name?.trim();
            if (!trimmed) return null;

            const response = await axios.get(
                `https://api.tibiadata.com/v4/character/${encodeURIComponent(trimmed)}`,
                { timeout: 10000 }
            );

            const data = response.data;
            if (!data || !data.character || !data.character.character) {
                console.error("Estrutura inesperada da TibiaData ou personagem inexistente.", data);
                return null;
            }

            const tibiaCharacter = data.character.character;
            return {
                name: tibiaCharacter.name,
                world: tibiaCharacter.world,
                vocation: tibiaCharacter.vocation,
                level: tibiaCharacter.level,
            };
        } catch (error: any) {
            console.error("Erro ao buscar personagem na API TibiaData:", error?.message || error);
            return null;
        }
    }
    
    

    async getUserCharacters(userId: string): Promise<Character[]> {
        return this.characterRepository.find({
            where: { user: { id: userId } },
            relations: ["world", "otServer"],
        });
    }
}
