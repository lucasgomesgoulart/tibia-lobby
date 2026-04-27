import { Expose, Type } from 'class-transformer';
import { CharacterResponseDto } from '../../characters/dto/character-response.dto';
import { LobbyResponseDto } from '../../lobby/dto/lobby-response.dto';

// DTO para quando jogador entra na lobby
export class LobbyPlayerJoinResponseDto {
  @Expose()
  id: string;

  @Expose()
  isLeader: boolean;

  @Expose()
  joined_at: Date;

  @Expose()
  left_at: Date;

  @Expose()
  @Type(() => CharacterResponseDto)
  character: CharacterResponseDto;

  @Expose()
  @Type(() => LobbyResponseDto)
  lobby: LobbyResponseDto;
}

// DTO para verificar lobby do usuário (endpoint check)
export class UserLobbyDataResponseDto {
  @Expose()
  myCharacterId: string;

  @Expose()
  @Type(() => LobbyResponseDto)
  lobby: LobbyResponseDto;
}
