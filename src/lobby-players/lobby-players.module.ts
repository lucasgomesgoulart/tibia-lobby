import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from 'src/db/entities/lobby.entity';
import { LobbyPlayer } from 'src/db/entities/LobbyPlayer.entity';
import { Character } from 'src/db/entities/Characters.entity';
import { User } from 'src/db/entities/user.entity';
import { ActivityType } from 'src/db/entities/activityType';
import { LobbiesService } from 'src/lobby/lobby.service';
import { LobbiesController } from 'src/lobby/lobby.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lobby,
      LobbyPlayer,
      Character,
      User,
      ActivityType,
    ]),
  ],
  providers: [LobbiesService],
  controllers: [LobbiesController],
})
export class LobbiesModule {}
