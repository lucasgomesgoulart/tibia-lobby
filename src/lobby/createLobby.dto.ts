import { IsString, IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class CreateLobbyDto {
  @IsString()
  title: string;

  @IsInt()
  @Min(1)
  minLevel: number;

  @IsInt()
  @Min(1)
  maxLevel: number;

  @IsInt()
  @Min(1)
  minPlayers: number;

  @IsInt()
  @Min(1)
  maxPlayers: number;

  // Como usamos a entidade ActivityType, aqui recebemos o ID
  @IsUUID()
  activityTypeId: string;

  @IsString()
  discordChannelLink: string;

  @IsOptional()
  @IsString()
  description?: string;

  // ID do character que será usado para criar a lobby
  @IsUUID()
  characterId: string;
}
