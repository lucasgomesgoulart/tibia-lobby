import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbyService } from "./lobby.service";
import { LobbyController } from "./lobby.controller";
import { Lobby } from "../db/entities/lobby.entity";
import { LobbyPlayer } from "../db/entities/lobbyPlayer.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "src/db/entities/Characters.entity";
import { LobbyGateway } from "./gateway";
import { LobbyPlayersService } from "src/lobby-players/lobby-players.service";
import { ActivityType } from "../db/entities/activityType";
import { ActivityTypeModule } from "../activity-type/activity-type.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Lobby, LobbyPlayer, Character, User, ActivityType]),
        ActivityTypeModule,
    ],
    controllers: [LobbyController],
    providers: [LobbyService, LobbyPlayersService, LobbyGateway],
    exports: [TypeOrmModule],
})
export class LobbyModule {}
