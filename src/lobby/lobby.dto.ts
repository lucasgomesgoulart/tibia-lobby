import { IsString, IsUUID, IsNumber, Min, IsOptional } from "class-validator";

export class LobbyDto {
    @IsUUID()
    @IsOptional()
    id?: string;

    @IsString()
    title: string;

    @IsNumber()
    @Min(1)
    minLevel: number;

    @IsNumber()
    maxLevel: number;

    @IsNumber()
    maxPlayers: number;

    @IsNumber()
    @Min(2)
    minPlayers: number;

    @IsUUID()
    activityTypeId: string;

    @IsString()
    discordChannelLink: string;

    @IsUUID()
    characterId: string;
}

export interface FindAllParameters {
    id?: string;
    title?: string;
    minLevel?: number;
    maxLevel?: number;
    maxPlayers?: number;
    minPlayers?: number;
    activityType?: string;
    ownerId?: string;
}