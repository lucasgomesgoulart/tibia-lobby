import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";
import { LobbyPlayersService } from "src/lobby-players/lobby-players.service";
import { LobbyGateway } from "./gateway";
import { ActivityType } from "src/db/entities/activityType";
import { Lobby } from "src/db/entities/Lobby.entity";
import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { LobbiesController } from "./lobby.controller";
import { LobbiesService } from "./lobby.service";

@Module({
    imports: [TypeOrmModule.forFeature([Lobby, LobbyPlayer,Character, User, ActivityType])],
    controllers: [LobbiesController],
    providers: [LobbiesService, LobbyPlayersService, LobbyGateway],
    exports: [TypeOrmModule],
})
export class LobbyModule {}
