// src/lobbies/lobbies.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LobbiesService } from './lobby.service';
import { CreateLobbyDto } from './createLobby.dto';
import { JoinLobbyDto } from './joinLobby.dto';

@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createLobby(@Body() createLobbyDto: CreateLobbyDto, @Req() req) {
    const userId = req.userId;
    const lobby = await this.lobbiesService.createLobby(userId, createLobbyDto);
    return { message: 'Lobby criada com sucesso', data: lobby };
  }

  @Post('join')
  @UseGuards(AuthGuard)
  async joinLobby(@Body() joinLobbyDto: JoinLobbyDto, @Req() req) {
    const userId = req.userId;
    const lobby = await this.lobbiesService.joinLobby(userId, joinLobbyDto);
    return { message: 'Participação na lobby realizada com sucesso', data: lobby };
  }
}
