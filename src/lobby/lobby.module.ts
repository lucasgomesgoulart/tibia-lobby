import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbiesService } from "./lobby.service";
import { LobbiesController } from "./lobby.controller";
import { Lobby } from "../db/entities/lobby.entity";
import { LobbyPlayer } from "../db/entities/lobbyPlayer.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";
import { LobbyGateway } from "./gateway";
import { LobbyPlayersService } from "src/lobby-players/lobby-players.service";

@Module({
    imports: [TypeOrmModule.forFeature([Lobby, LobbyPlayer,Character, User])],
    controllers: [LobbiesController],
    providers: [LobbiesService, LobbyPlayersService, LobbyGateway],
    exports: [TypeOrmModule],
})
export class LobbyModule {}
