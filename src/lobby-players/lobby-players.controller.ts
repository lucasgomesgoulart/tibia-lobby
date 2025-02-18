import { Body, Controller, Delete, Get,Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { LobbyPlayersService } from "./lobby-players.service";

@UseGuards(AuthGuard)
@Controller("lobby-players")
export class LobbyPlayersController {
  constructor(
    private readonly lobbyPlayersService: LobbyPlayersService
  ) {}

  @Post("join/:lobbyId/:characterId")
  async joinLobby(@Param("lobbyId") lobbyId: string, @Param("characterId") characterId: string, @Req() req) {
    const userId = req.userId;
    const lobbyPlayer = await this.lobbyPlayersService.joinLobby(lobbyId, characterId, userId);
    return { message: "Entrou na lobby com sucesso.", data: lobbyPlayer };
  }

  @Delete("my-lobby")
  async leaveOrDeleteLobby(@Req() req) {
    const userId = req.userId;
    await this.lobbyPlayersService.leaveOrDeleteLobby(userId);
    return { message: "Lobby atualizada com sucesso." };
  }

  @Get("check")
  async checkLobby(@Req() req) {
    const userId = req.userId;
    const lobbyData = await this.lobbyPlayersService.getUserLobbyData(userId);
    if (!lobbyData) {
      return { message: "Nenhuma lobby ativa encontrada.", data: null };
    }
    return { message: "Lobby carregada com sucesso.", data: lobbyData, userId };
  }
}
