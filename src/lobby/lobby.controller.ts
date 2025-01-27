import { Body, Controller, Post, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { LobbyDto } from './lobby.dto';
import { LobbyService } from './lobby.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('lobby')
export class LobbyController {
    constructor(private readonly LobbyService: LobbyService) {}

    @Post()
    async create(@Body() lobby: LobbyDto) {
        try {
            const newLobby = await this.LobbyService.createLobby(lobby);
            return { message: "Lobby criada com sucesso.", data: newLobby };
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao criar lobby", error: error.stack },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
