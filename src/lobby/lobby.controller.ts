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
        this.LobbyService.create(lobby)
    }

    @Get('/:id')
    findById(@Param('id') id: string) {
        return this.LobbyService.findById(id);
    }

    @Get()
    findAll(@Query() params: FindAllParameters): LobbyDto[] {
        return this.LobbyService.findAll(params)
    }

    @Put('/:id')
    update(@Body() lobby: LobbyDto) {
        return this.LobbyService.update(lobby)
    }

    @Delete('/:id')
    delete(@Param('id') id: string) {
        return this.LobbyService.delete(id)
    }
}
