import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { OtServersService } from "./otservers.service";
import { plainToClass } from 'class-transformer';
import { OtServerResponseDto } from './dto/otserver-response.dto';
import { WorldResponseDto } from '../worlds/dto/world-response.dto';

@Controller("otservers")
export class OtServersController {
    constructor(private readonly otServersService: OtServersService) {}

    @Get()
    async getAllOtServers() {
        const otServers = await this.otServersService.getAllOtServers();
        return otServers.map(otServer => 
            plainToClass(OtServerResponseDto, otServer, { excludeExtraneousValues: true })
        );
    }

    @Post()
    async createOtServer(@Body() body: { name: string; worldNames: string[] }) {
        const newOtServer = await this.otServersService.createOtServer(body.name, body.worldNames);
        return plainToClass(OtServerResponseDto, newOtServer, { excludeExtraneousValues: true });
    }

    @Get("/:id/worlds")
    async getWorldsByOtServer(@Param("id") otServerId: string) {
        const worlds = await this.otServersService.getWorldsByOtServer(otServerId);
        return worlds.map(world => 
            plainToClass(WorldResponseDto, world, { excludeExtraneousValues: true })
        );
    }
}
