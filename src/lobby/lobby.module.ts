import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbyService } from "./lobby.service";
import { LobbyController } from "./lobby.controller";
import { Lobby } from "../db/entities/lobby.entity";
import { LobbyPlayer } from "../db/entities/lobbyPlayer.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Lobby, LobbyPlayer,Character, User])],
    controllers: [LobbyController],
    providers: [LobbyService],
    exports: [TypeOrmModule],
})
export class LobbyModule {}
