import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LobbyPlayersService } from "./lobby-players.service";
import { LobbyPlayersController } from "./lobby-players.controller";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";
import { User } from "src/db/entities/User.entity";
import { Lobby } from "src/db/entities/Lobby.entity";
import { Character } from "src/db/entities/Characters.entity";

@Module({
    imports: [TypeOrmModule.forFeature([LobbyPlayer, Character,User, Lobby])],
    controllers: [LobbyPlayersController],
    providers: [LobbyPlayersService],
    exports: [TypeOrmModule],
})
export class LobbyPlayersModule {}
