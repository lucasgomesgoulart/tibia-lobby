import { IsString, IsEnum, IsOptional } from "class-validator";
import { ServerType, Vocations } from "src/db/entities/Characters.entity";


export class CharacterDto {
    @IsString()
    name: string;

    @IsEnum(ServerType)
    serverType: ServerType;

    @IsEnum(Vocations)
    vocation: Vocations;

    @IsOptional()
    @IsString()
    world?: string; 

    @IsOptional()
    @IsString()
    otServer?: string;


}
