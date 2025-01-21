import { IsUUID, IsString, IsEmail, MinLength, IsOptional } from "class-validator";

export class UserDto {
    @IsUUID()
    @IsOptional()
    id: string;

    @IsString()
    name: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}