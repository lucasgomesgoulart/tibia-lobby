import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { CharacterDto } from "./character.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { CharacterService } from "./characters.service";
import { plainToClass } from 'class-transformer';
import { CharacterResponseDto } from './dto/character-response.dto';
import { Delete, Param } from "@nestjs/common";

@UseGuards(AuthGuard)
@Controller("characters")
export class CharacterController {
    constructor(private readonly characterService: CharacterService) {}

    @Post()
    async createCharacter(@Body() character: CharacterDto, @Req() req) {
        const userId = req.userId;
        const newCharacter = await this.characterService.createCharacter(character, userId);
        return plainToClass(CharacterResponseDto, newCharacter, { excludeExtraneousValues: true });
    }

    @Get()
    async getUserCharacters(@Req() req) {
        const userId = req.userId;
        const characters = await this.characterService.getUserCharacters(userId);
        return characters.map(character => 
            plainToClass(CharacterResponseDto, character, { excludeExtraneousValues: true })
        );
    }

    @Delete(":id")
    async deleteCharacter(@Param("id") characterId: string, @Req() req) {
        const userId = req.userId;
        await this.characterService.deleteCharacter(characterId, userId);
        return { message: 'Personagem deletado com sucesso.' };
    }
}
