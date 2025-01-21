import { IsString, IsUUID, IsNumber, IsArray, Min, IsEnum } from "class-validator";


export enum ActivityType {
    PVP = "PVP",
    HUNT = "HUNT",
    QUEST = "QUEST",
    BOSS = "BOSS",
    WAR = "WAR",
    EVENT = "EVENT",
}

export class LobbyDto {
    @IsUUID()
    lobbyId: string;

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
    activityType: string;

    @IsString()
    ownerId: string;

    @IsArray()
    @IsString({ each: true }) 
    playerIds: string[];

    @IsString()
    discordChannelLink: string;
}
