import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LobbyPlayersService } from './lobby-players.service';
import { CreateLobbyPlayerDto } from './lobbyPlayer.dto';

@Controller('lobby-players')
export class LobbyPlayersController {
  constructor(private readonly lobbyPlayersService: LobbyPlayersService) {}

 
}
