import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbyModule } from './lobby/lobby.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config'
import { DbModule } from './db/db.module';
import { LobbyPlayersModule } from './lobby-players/lobby-players.module';
import { CharactersModule } from './characters/characters.module';
import { WorldsModule } from './worlds/worlds.module';
import { OtserversModule } from './otservers/otservers.module';
import {ActivityTypeModule } from './activity-type/activity-type.module'
import { SeedModule } from './seed/seed.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ActivityTypeModule,
    LobbyModule,
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(), // Habilita cron jobs
    DbModule,
    LobbyPlayersModule,
    CharactersModule,
    WorldsModule,
    OtserversModule,
    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }