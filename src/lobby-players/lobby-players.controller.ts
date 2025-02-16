import { LobbyService } from './../lobby/lobby.service';
import { Controller, Post, UseGuards, Req, Param, HttpException, HttpStatus, Delete, Get, Put } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { LobbyPlayersService } from "./lobby-players.service";

@UseGuards(AuthGuard)
@Controller("lobby-players")
export class LobbyPlayersController {
    constructor(
        private readonly lobbyPlayersService: LobbyPlayersService,
        private readonly LobbyService: LobbyService
    ) { }

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

    @Put("left-lobby/:lobbyId/:characterId")
    async leftLobby(@Param("lobbyId") lobbyId: string, @Param("characterId") characterId: string, @Req() req) {
        const userId = req.userId;
        try {
            await this.lobbyPlayersService.leaveLobby(lobbyId, characterId, userId);
            return { message: "Saiu da lobby com sucesso." };
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao sair da lobby", error: error.stack },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    @Get("check")
    async checkLobby(@Req() req) {
        try {
            const userId = req.userId;
            const lobby = await this.LobbyService.getUserLobby(userId);

            if (!lobby) {
                return { message: "Nenhuma lobby ativa encontrada.", data: null };
            }

            return { message: "Lobby carregada com sucesso.", data: lobby, userId: userId };
        } catch (err) {
            throw new HttpException(
                { message: err.message || "Erro ao buscar a lobby do usuário", error: err.stack },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
