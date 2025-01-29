import { IsString, IsEnum, IsOptional } from "class-validator";
import { ServerType } from "src/db/entities/Characters.entity";


export class CharacterDto {
    @IsString()
    name: string;

    @IsEnum(ServerType)
    serverType: ServerType;

    @IsString()
    vocation: string;

    @IsOptional()
    @IsString()
    world?: string; 

    @IsOptional()
    @IsString()
    otServer?: string;
}
