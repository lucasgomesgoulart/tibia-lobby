import { Body, Controller, Delete, Get,Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { LobbyPlayersService } from "./lobby-players.service";
import { plainToClass } from 'class-transformer';
import { LobbyPlayerJoinResponseDto, UserLobbyDataResponseDto } from './dto/lobby-player-response.dto';

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
    return plainToClass(LobbyPlayerJoinResponseDto, lobbyPlayer, { excludeExtraneousValues: true });
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
      return null;
    }
    
    return plainToClass(UserLobbyDataResponseDto, lobbyData, { excludeExtraneousValues: true });
  }
}
