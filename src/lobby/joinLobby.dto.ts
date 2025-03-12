// src/lobbies/dto/join-lobby.dto.ts
import { IsUUID } from 'class-validator';

export class JoinLobbyDto {
  @IsUUID()
  lobbyId: string;
  @IsUUID()
  characterId: string;
}
