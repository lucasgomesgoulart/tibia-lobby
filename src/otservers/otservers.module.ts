import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OtServer } from "../db/entities/otserver.entity";
import { World } from "../db/entities//world.entity" 
import { OtServersService } from "./otservers.service";
import { OtServersController } from "./otservers.controller";

@Module({
    imports: [TypeOrmModule.forFeature([OtServer, World])], 
    controllers: [OtServersController],
    providers: [OtServersService],
    exports: [TypeOrmModule],
})
export class OtserversModule {}
