import { Body, Controller, Post, UseGuards, HttpException, HttpStatus, Delete, Param, Req, Put, Get, Query } from "@nestjs/common";
import { FindAllParameters, LobbyDto } from "./lobby.dto";
import { LobbyService } from "./lobby.service";
import { AuthGuard } from "src/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller("lobby")
export class LobbyController {
    constructor(private readonly LobbyService: LobbyService) { }

    // 🔹 Criar uma nova lobby
    @Post()
    async create(@Body() lobby: LobbyDto, @Req() req) {
        try {
            const userId = req.userId
            console.log(userId)
            const newLobby = await this.LobbyService.createLobby(lobby, userId);

            return { message: "Lobby criada com sucesso.", data: newLobby };
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao criar lobby", error: error.stack },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Put(":id")
    async updateLobby(@Param("id") lobbyId: string, @Body() lobby: LobbyDto, @Req() req) {

        const userId = req.userId
        try {
            const updatedLobby = await this.LobbyService.updateLobby(lobby, userId, lobbyId)
            return { message: "Lobby atualizada com sucesso.", data: updatedLobby };
        } catch (err) {
            throw new HttpException(
                { message: err.message || "Erro ao atualizar lobby", error: err.stack },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


    @Delete(":id")
    async deleteLobby(@Param("id") lobbyId: string, @Req() req) {
        try {
            const idUserLogado = req.userId
            console.log(idUserLogado)
            await this.LobbyService.deleteLobby(lobbyId, idUserLogado);
            return { message: "Lobby marcada como deletada com sucesso." };
        } catch (err) {
            throw new HttpException(
                { message: err.message || "Erro ao deletar lobby", error: err.stack },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    async getAllLobbies(@Query() filters: FindAllParameters) {

        try {
            const lobbies = await this.LobbyService.getAllLobbies(filters);
            return { message: "Lobbies encontradas com sucesso.", data: lobbies };
        } catch (err) {
            throw new HttpException(
                { message: err.message || "Erro ao buscar lobbies", error: err.stack },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }


}
