import { Controller, Get, Post, Body } from "@nestjs/common";
import { WorldsService } from "./worlds.service";

@Controller("worlds")
export class WorldsController {
    constructor(private readonly worldsService: WorldsService) {}

    @Get("/global")
    async getGlobalWorlds() {
        const worlds = await this.worldsService.getGlobalWorlds();
        return { message: "Mundos do Tibia Global carregados.", data: worlds };
    }

    @Post()
    async createWorld(@Body() body: { name: string }) {
        const newWorld = await this.worldsService.createWorld(body.name, true);
        return { message: "Mundo cadastrado com sucesso.", data: newWorld };
    }
}
