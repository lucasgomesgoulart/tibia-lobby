import { Controller, Post, UseGuards, Req, Param, HttpException, HttpStatus, Delete } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { LobbyPlayersService } from "./lobby-players.service";

@UseGuards(AuthGuard)
@Controller("lobby-players")
export class LobbyPlayersController {
    constructor(private readonly lobbyPlayersService: LobbyPlayersService) { }

    @Post("join/:lobbyId/:characterId")
    async joinLobby(@Param("lobbyId") lobbyId: string, @Param("characterId") characterId: string, @Req() req) {
        try {
            const userId = req.userId
            const lobbyPlayer = await this.lobbyPlayersService.joinLobby(lobbyId, characterId, userId);
            return { message: "Entrou na lobby com sucesso.", data: lobbyPlayer };
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao entrar na lobby", error: error.stack },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Delete("left-lobby/:lobbyId/:characterId")
    async leftLobby(@Param("lobbyId") lobbyId: string, @Param("characterId") characterId: string, @Req() req){
        try {
            await this.lobbyPlayersService.leaveLobby(lobbyId, characterId);
            return { message: "Saiu da lobby com sucesso." };
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao sair da lobby", error: error.stack },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
