import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { World } from "../db/entities/world.entity";

@Injectable()
export class WorldsService {
    constructor(
        @InjectRepository(World)
        private readonly worldRepository: Repository<World>
    ) {}

    async getGlobalWorlds(): Promise<World[]> {
        return this.worldRepository.find({ where: { isGlobal: true } });
    }

    async createWorld(name: string, isGlobal: boolean): Promise<World> {
        const world = this.worldRepository.create({ name, isGlobal });
        return await this.worldRepository.save(world);
    }
}
