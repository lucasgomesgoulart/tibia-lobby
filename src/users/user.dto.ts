import { IsUUID } from "class-validator";

export class UserDto{
    @IsUUID()
    id: string;

    @IsString()
    name: string;

    @
    username: string;
    email: string;
    password;
}

