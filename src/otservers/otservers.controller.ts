import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { OtServersService } from "./otservers.service";

@Controller("otservers")
export class OtServersController {
    constructor(private readonly otServersService: OtServersService) {}

    @Get()
    async getAllOtServers() {
        const otServers = await this.otServersService.getAllOtServers();
        return { message: "Lista de OTServers carregada.", data: otServers };
    }

    @Post()
    async createOtServer(@Body() body: { name: string; worldNames: string[] }) {
        const newOtServer = await this.otServersService.createOtServer(body.name, body.worldNames);
        return { message: "OTServer cadastrado com sucesso.", data: newOtServer };
    }

    @Get("/:id/worlds")
    async getWorldsByOtServer(@Param("id") otServerId: string) {
        const worlds = await this.otServersService.getWorldsByOtServer(otServerId);
        return { message: `Mundos do OTServer carregados.`, data: worlds };
    }
}
