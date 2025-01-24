import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbyModule } from './lobby/lobby.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import {ConfigModule} from '@nestjs/config'
import { DbModule } from './db/db.module';
import { LobbyPlayersModule } from './lobby-players/lobby-players.module';

@Module({
  imports: [LobbyModule, UsersModule, AuthModule, ConfigModule.forRoot({isGlobal: true}), DbModule, LobbyPlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }