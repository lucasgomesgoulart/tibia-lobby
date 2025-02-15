import { IsString, IsEnum, IsOptional, IsUUID, IsNumber } from "class-validator";
import { ServerType, Vocations } from "src/db/entities/Characters.entity";

export class CharacterDto {
    @IsString()
    name: string;

    @IsEnum(ServerType)
    serverType: ServerType;

    @IsOptional()  // 🔹 Agora vocação é opcional (para GLOBAL)
    @IsEnum(Vocations, {
        message: "Vocação inválida. Deve ser uma das seguintes: DRUID, SORCERER, KNIGHT, PALADIN",
    })
    vocation?: Vocations;

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
