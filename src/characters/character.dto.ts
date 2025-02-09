import { IsString, IsEnum, IsOptional, IsUUID, isNumber, isString, IsNumber } from "class-validator";
import { ServerType, Vocations } from "src/db/entities/Characters.entity";

export class CharacterDto {
    @IsString()
    name: string;

    @IsEnum(ServerType)
    serverType: ServerType;

    @IsEnum(Vocations)
    vocation: Vocations;

    @IsOptional()
    @IsUUID()
    worldId?: string; 

    @IsOptional()
    @IsNumber()
    level?: number;

    @IsOptional()
    @IsUUID()
    otServerId?: string; 
}
