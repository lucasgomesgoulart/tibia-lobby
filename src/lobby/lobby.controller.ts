import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { LobbyService } from "./lobby.service";
import { AuthGuard } from "src/auth/auth.guard";
import { FindAllParameters, LobbyDto } from "./lobby.dto";

@UseGuards(AuthGuard)
@Controller("lobby")
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post()
  async create(@Body() lobby: LobbyDto, @Req() req) {
    const userId = req.userId;
    const { characterId } = lobby;
    if (!characterId) {
      throw new HttpException("É necessário escolher um personagem para entrar na lobby.", HttpStatus.BAD_REQUEST);
    }

    const newLobby = await this.lobbyService.createLobby(lobby, userId, characterId);
    return { message: "Lobby criada com sucesso.", data: newLobby };
  }

  @Put(":id")
  async updateLobby(@Param("id") lobbyId: string, @Body() lobby: LobbyDto, @Req() req) {
    const userId = req.userId;
    await this.lobbyService.updateLobby(lobby, userId, lobbyId);
    return { message: "Lobby atualizada com sucesso." };
  }

  @Get()
  async getAllLobbies(@Query() filters: FindAllParameters) {
    const lobbies = await this.lobbyService.getAllLobbies(filters);
    return { message: "Lobbies encontradas com sucesso.", data: lobbies };
  }
}
