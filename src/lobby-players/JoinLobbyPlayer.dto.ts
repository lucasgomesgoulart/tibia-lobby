import { IsUUID } from 'class-validator';

export class JoinLobbyPlayerDto {
  @IsUUID()
  lobbyId: string;

  @IsUUID()
  characterId: string;
}
