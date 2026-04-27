import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ActivityTypeResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class CharacterMinimalResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  level: number;

  @Expose()
  vocation: string;
}

export class LobbyPlayerResponseDto {
  @Expose()
  id: string;

  @Expose()
  isLeader: boolean;

  @Expose()
  joined_at: Date;

  @Expose()
  left_at: Date;

  @Expose()
  @Type(() => CharacterMinimalResponseDto)
  character: CharacterMinimalResponseDto;
}

export class LobbyResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  minLevel: number;

  @Expose()
  maxLevel: number;

  @Expose()
  maxPlayers: number;

  @Expose()
  minPlayers: number;

  @Expose()
  discordChannelLink: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  @Expose()
  @Type(() => ActivityTypeResponseDto)
  activityType: ActivityTypeResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  owner: UserResponseDto;

  @Expose()
  @Type(() => LobbyPlayerResponseDto)
  players: LobbyPlayerResponseDto[];

  // Propriedade calculada
  @Expose()
  get currentPlayers(): number {
    return this.players?.filter(p => !p.left_at).length || 0;
  }

  @Expose()
  get isActive(): boolean {
    return !this.isDeleted;
  }

  isDeleted: boolean; // Não exposta, apenas para uso interno
}
