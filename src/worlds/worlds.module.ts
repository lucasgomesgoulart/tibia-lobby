import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { World } from "../db//entities/world.entity";
import { WorldsService } from "./worlds.service";
import { WorldsController } from "./worlds.controller";

@Module({
    imports: [TypeOrmModule.forFeature([World])], 
    controllers: [WorldsController],
    providers: [WorldsService],
    exports: [TypeOrmModule]
})
export class WorldsModule {}
