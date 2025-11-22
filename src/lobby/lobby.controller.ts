import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { LobbyService } from "./lobby.service";
import { AuthGuard } from "src/auth/auth.guard";
import { FindAllParameters, LobbyDto } from "./lobby.dto";
import { plainToClass } from 'class-transformer';
import { LobbyResponseDto } from './dto/lobby-response.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';

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
    if (!lobby.activityTypeId) {
      throw new HttpException("É necessário escolher um tipo de atividade.", HttpStatus.BAD_REQUEST);
    }

    const newLobby = await this.lobbyService.createLobby(lobby, userId, characterId);
    return plainToClass(LobbyResponseDto, newLobby, { excludeExtraneousValues: true });
  }

  @Put(":id")
  async updateLobby(@Param("id") lobbyId: string, @Body() lobby: LobbyDto, @Req() req) {
    const userId = req.userId;
    const updatedLobby = await this.lobbyService.updateLobby(lobby, userId, lobbyId);
    return plainToClass(LobbyResponseDto, updatedLobby, { excludeExtraneousValues: true });
  }

  @Get()
  async getAllLobbies(
    @Query() filters: FindAllParameters,
    @Query() pagination: PaginationDto
  ): Promise<PaginatedResponse<LobbyResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    
    const [lobbies, total] = await this.lobbyService.getAllLobbies(filters, skip, limit);
    
    const items = lobbies.map(lobby => 
      plainToClass(LobbyResponseDto, lobby, { excludeExtraneousValues: true })
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }
}
