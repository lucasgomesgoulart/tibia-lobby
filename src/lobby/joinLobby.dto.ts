import { IsUUID } from "class-validator";

export class JoinLobbyDto {
    @IsUUID()
    characterId: string;
}
