import { IsString, IsUUID, IsNumber, Min, IsEnum, IsOptional } from "class-validator";
import { ActivityType } from "../db/entities/lobby.entity"; // Certifique-se que o caminho está correto

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

    @IsEnum(ActivityType)
    activityType: ActivityType;

    @IsString()
    discordChannelLink: string;
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