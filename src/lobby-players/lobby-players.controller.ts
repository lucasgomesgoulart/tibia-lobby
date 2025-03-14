import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { LobbyPlayersService } from "./lobby-players.service";
import { JoinLobbyPlayerDto } from "./JoinLobbyPlayer.dto";

@UseGuards(AuthGuard)
@Controller("lobby-players")
export class LobbyPlayersController {
  constructor(
    private readonly lobbyPlayersService: LobbyPlayersService
  ) { }

  @Post("join")
  async joinLobby(@Body() joinLobbyPlayerDto: JoinLobbyPlayerDto, @Req() req) {
    const userId = req.userId;
    const lobbyPlayer = await this.lobbyPlayersService.joinLobby(
      joinLobbyPlayerDto.lobbyId,
      joinLobbyPlayerDto.characterId,
      userId
    );
    return { message: "Entrou na lobby com sucesso.", data: lobbyPlayer };
  }
  

  @Delete("my-lobby")
  async deleteLobby(@Req() req) {
    const userId = req.userId;
    await this.lobbyPlayersService.deleteLobby(userId);
    return { message: "Lobby excluída com sucesso." };
  }

  @Delete("exit")
  async exitLobby(@Req() req) {
    const userId = req.userId;
    await this.lobbyPlayersService.exitLobby(userId);
    return { message: "Você saiu da lobby com sucesso." };
  }
}
