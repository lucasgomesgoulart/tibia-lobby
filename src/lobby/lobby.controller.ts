import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { FindAllParameters, LobbyDto } from './lobby.dto';
import { LobbyService } from './lobby.service';
import { AuthGuard } from 'src/auth/auth.guard';


@UseGuards(AuthGuard)
@Controller('lobby')
export class LobbyController {

    constructor(private readonly LobbyService: LobbyService) { }
    @Post()
    create(@Body() lobby: LobbyDto) {
        this.LobbyService.createLobby(lobby)
    }
}
