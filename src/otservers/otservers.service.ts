import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OtServer } from "../db/entities//otserver.entity";
import { World } from "../db/entities/world.entity"

@Injectable()
export class OtServersService {
    constructor(
        @InjectRepository(OtServer)
        private readonly otServerRepository: Repository<OtServer>,

        @InjectRepository(World)
        private readonly worldRepository: Repository<World>
    ) {}

    async getAllOtServers(): Promise<OtServer[]> {
        return this.otServerRepository.find({ relations: ["worlds"] });
    }

    async createOtServer(name: string, worldNames: string[]): Promise<OtServer> {
        const otServer = this.otServerRepository.create({ name });

        const savedOtServer = await this.otServerRepository.save(otServer);

        const worlds = worldNames.map((worldName) =>
            this.worldRepository.create({ name: worldName, isGlobal: false, otServer: savedOtServer })
        );

        await this.worldRepository.save(worlds);

        return savedOtServer;
    }

    async getWorldsByOtServer(otServerId: string): Promise<World[]> {
        return this.worldRepository.find({ where: { otServer: { id: otServerId } } });
    }
}
