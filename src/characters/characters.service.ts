import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
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
            const response = await fetch(`https://api.tibiadata.com/v4/character/${encodeURIComponent(name)}`);
     
    
            if (!response.ok) {
                throw new Error(`Erro na API TibiaData: ${response.statusText}`);
            }
    
            const data = await response.json();
          
            // 🚀 Ajustando o acesso correto aos dados
            if (!data || !data.character || !data.character.character) {
                console.error("Erro: Estrutura da resposta da API TibiaData mudou ou personagem não encontrado.", data);
                return null;
            }
    
            const tibiaCharacter = data.character.character; // 🔹 Correção AQUI!
            
         
            return {
                name: tibiaCharacter.name,
                world: tibiaCharacter.world,
                vocation: tibiaCharacter.vocation,
                level: tibiaCharacter.level,
            };
        } catch (error) {
            console.error("Erro ao buscar personagem na API TibiaData:", error);
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
