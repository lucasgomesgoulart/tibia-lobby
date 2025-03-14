import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbiesService } from "./lobby.service";
import { LobbiesController } from "./lobby.controller";
import { Lobby } from "../db/entities/lobby.entity";
import { LobbyPlayer } from "../db/entities/lobbyPlayer.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";
import { LobbyPlayersService } from "src/lobby-players/lobby-players.service";
import { LobbyGateway } from "./gateway";
import { ActivityType } from "src/db/entities/activityType";

@Module({
    imports: [TypeOrmModule.forFeature([Lobby, LobbyPlayer,Character, User, ActivityType])],
    controllers: [LobbiesController],
    providers: [LobbiesService, LobbyPlayersService, LobbyGateway],
    exports: [TypeOrmModule],
})
export class LobbyModule {}
