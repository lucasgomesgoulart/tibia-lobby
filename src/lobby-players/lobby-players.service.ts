import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";
import { Lobby } from "../db/entities/Lobby.entity";
import { User } from "../db/entities/User.entity";
import { Character } from "../db/entities/Characters.entity";
import { v4 as uuid } from "uuid"

@Injectable()
export class LobbyPlayersService {
    constructor(
        @InjectRepository(LobbyPlayer)
        private readonly lobbyPlayerRepo: Repository<LobbyPlayer>,

        @InjectRepository(Lobby)
        private readonly lobbyRepo: Repository<Lobby>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Character)
        private readonly characterRepo: Repository<Character>
    ) { }

    async joinLobby(lobbyId: string, characterId: string, userId: string): Promise<LobbyPlayer> {

        const lobby = await this.lobbyRepo.findOne({
            where: { id: lobbyId, isDeleted: false },
            relations: ["players"],
        });

        if (!lobby) {
            throw new NotFoundException("Lobby não encontrada ou foi deletada.");
        }

        const playerCount = await this.lobbyPlayerRepo.count({ where: { lobby: { id: lobbyId } } });

        if (playerCount >= lobby.maxPlayers) {
            throw new ForbiddenException("Lobby está cheia.");
        }

        const character = await this.characterRepo.findOne({
            where: { id: characterId, user: { id: userId } },
            relations: ["world", "otServer"],
        });

        if (!character) {
            throw new ForbiddenException("Personagem não encontrado ou pertence a outro usuário.");
        }

        const characterInAnotherLobby = await this.lobbyPlayerRepo.findOne({
            where: {
                character: { id: characterId },
                left_at: IsNull()
            },
        });

        if (characterInAnotherLobby) {
            throw new ForbiddenException("Este personagem já está em uma lobby ativa.");
        }

        const newLobbyPlayer = this.lobbyPlayerRepo.create({
            id: uuid(),
            character: character,
            lobby: lobby,
            joined_at: new Date(),
            left_at: null
        });

        return this.lobbyPlayerRepo.save(newLobbyPlayer);
    }
    

    async leaveLobby(lobbyId: string, characterId: string): Promise<void> {
        const player = await this.lobbyPlayerRepo.findOne({
            where: {
                lobby: { id: lobbyId },
                character: { id: characterId },
                left_at: IsNull()
            },
        });
        if (!player) {
            throw new NotFoundException("O personagem não está nesta lobby ativa.");
        }
        player.left_at = new Date();
        await this.lobbyPlayerRepo.save(player);
    }
}
