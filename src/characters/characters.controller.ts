import { Controller, Post, Get, Body, UseGuards, Req } from "@nestjs/common";
import { CharacterDto } from "./character.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { CharacterService } from "./characters.service";

@UseGuards(AuthGuard)
@Controller("characters")
export class CharacterController {
    constructor(private readonly characterService: CharacterService) {}

    @Post()
    async createCharacter(@Body() character: CharacterDto, @Req() req) {
        const userId = req.userId
        const newCharacter = await this.characterService.createCharacter(character, userId);
        return { message: "Personagem cadastrado com sucesso.", data: newCharacter };
    }

    @Get()
    async getUserCharacters(@Req() req) {
        const userId = req.userId
        const characters = await this.characterService.getUserCharacters(userId);
        return { message: "Lista de personagens carregada.", data: characters };
    }
}
