import { IsString, IsUUID, IsOptional, IsEmail, IsArray } from "class-validator";
import { Lobby } from "../db/entities/Lobby.entity";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";

export class UserDto {
    @IsUUID()
    @IsOptional()
    id: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    @IsOptional()
    full_name: string;

    @IsString()
    @IsOptional()
    phone: string;

    // Endereço
    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    zip_code: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    address_2: string;

    // 🔹 Lobbies criadas pelo usuário
    @IsArray()
    @IsOptional()
    lobbiesOwned?: Lobby[];

    // 🔹 Lobby onde o usuário está participando
    @IsArray()
    @IsOptional()
    lobbiesJoined?: LobbyPlayer[];
}
