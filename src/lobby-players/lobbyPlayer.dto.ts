import { IsUUID } from "class-validator";

export class CreateLobbyPlayerDto {
    @IsUUID()
    userId: string;

    @IsUUID()
    lobbyId: string;
}
