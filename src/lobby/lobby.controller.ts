// src/lobbies/lobbies.controller.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { LobbiesService } from './lobby.service';
import { FilterLobbiesDto } from './filter-lobbies.dto';

@UseGuards(AuthGuard)
@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  // Endpoint para listar lobbies com filtros e paginação
  @Get()
  async getLobbies(@Query() filter: FilterLobbiesDto) {
    const lobbies = await this.lobbiesService.findLobbies(filter);
    return { message: 'Lobbies carregadas com sucesso', data: lobbies };
  }

  // Endpoint para recuperar a lobby em que o usuário está (se houver)
  @Get('me')
  async getUserLobby(@Req() req) {
    const userId = req.userId;
    const lobbyData = await this.lobbiesService.getUserLobbyData(userId);
    if (!lobbyData) {
      return { message: 'Nenhuma lobby ativa encontrada', data: null };
    }
    return { message: 'Lobby carregada com sucesso', data: lobbyData };
  }
}
