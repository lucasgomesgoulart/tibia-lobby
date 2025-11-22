import { Controller, Get, Post, Body } from "@nestjs/common";
import { WorldsService } from "./worlds.service";
import { plainToClass } from 'class-transformer';
import { WorldResponseDto } from './dto/world-response.dto';

@Controller("worlds")
export class WorldsController {
    constructor(private readonly worldsService: WorldsService) {}

    @Get("/global")
    async getGlobalWorlds() {
        const worlds = await this.worldsService.getGlobalWorlds();
        return worlds.map(world => 
            plainToClass(WorldResponseDto, world, { excludeExtraneousValues: true })
        );
    }

    @Post()
    async createWorld(@Body() body: { name: string }) {
        const newWorld = await this.worldsService.createWorld(body.name, true);
        return plainToClass(WorldResponseDto, newWorld, { excludeExtraneousValues: true });
    }
}
