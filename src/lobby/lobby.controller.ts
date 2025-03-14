import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LobbiesService } from './lobby.service';
import { FilterLobbiesDto } from './filter-lobbies.dto';
import { CreateLobbyDto } from './createLobby.dto';

@UseGuards(AuthGuard)
@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  // Lista as lobbies ativas com filtros
  @Get()
  async getLobbies(@Query() filter: FilterLobbiesDto) {
    const lobbies = await this.lobbiesService.findLobbies(filter);
    return { message: 'Lobbies carregadas com sucesso', data: lobbies };
  }

  // Retorna a lobby na qual o usuário está participando, se houver
  @Get('me')
  async getUserLobby(@Req() req) {
    const userId = req.userId;
    const lobbyData = await this.lobbiesService.getUserLobbyData(userId);
    if (!lobbyData) {
      return { message: 'Nenhuma lobby ativa encontrada', data: null };
    }
    return { message: 'Lobby carregada com sucesso', data: lobbyData };
  }

  // Cria uma nova lobby
  @Post()
  async createLobby(@Body() createLobbyDto: CreateLobbyDto, @Req() req) {
    const userId = req.userId;
    const lobby = await this.lobbiesService.createLobby(userId, createLobbyDto);
    return { message: 'Lobby criada com sucesso', data: lobby };
  }
}
