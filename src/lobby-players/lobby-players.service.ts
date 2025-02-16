import { Injectable, NotFoundException, BadRequestException, ForbiddenException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";
import { Lobby } from "../db/entities/Lobby.entity";
import { User } from "../db/entities/User.entity";
import { Character } from "../db/entities/Characters.entity";

@Injectable()
export class LobbyPlayersService {
    constructor(
        @InjectRepository(LobbyPlayer)
        private readonly lobbyPlayersRepository: Repository<LobbyPlayer>,

        @InjectRepository(Lobby)
        private readonly lobbyRepository: Repository<Lobby>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Character)
        private readonly characterRepository: Repository<Character>
    ) { }

    async getUserLobby(userId: string) {
        const playerInLobby = await this.lobbyPlayersRepository.findOne({
            where: { character: { user: { id: userId } }, left_at: null },
            relations: ['lobby', 'lobby.players', 'lobby.players.character', 'lobby.owner', 'character', 'character.user'],
        });

        if (!playerInLobby) return null

        return playerInLobby.lobby;
    }

    async joinLobby(lobbyId: string, characterId: string, userId: string) {
        // Verifica se o userId já é dono de uma lobby
        const ownedLobby = await this.lobbyRepository.findOne({ where: { owner: { id: userId }, isDeleted: false } });
        if (ownedLobby) {
            throw new HttpException('Você já possui uma lobby ativa como dono.', HttpStatus.FORBIDDEN);
        }

        // Verifica se o userId já está em uma lobby
        const playerInLobby = await this.lobbyPlayersRepository.findOne({
            where: { character: { user: { id: userId } }, left_at: null },
            relations: ['character', 'character.user'],
        });

        if (playerInLobby) {
            throw new HttpException('Você já está em uma lobby ativa como jogador.', HttpStatus.FORBIDDEN);
        }

        // Verifica se o character já está em outra lobby
        const characterInLobby = await this.lobbyPlayersRepository.findOne({
            where: { character: { id: characterId }, left_at: null },
        });

        if (characterInLobby) {
            throw new HttpException('Este personagem já está em uma lobby ativa.', HttpStatus.FORBIDDEN);
        }

        // Se passar as verificações, insere o novo player
        return this.lobbyPlayersRepository.save({
            lobby: { id: lobbyId },
            character: { id: characterId },
            joined_at: new Date(),
        });
    }


    async leaveLobby(lobbyId: string, characterId: string, userId: string): Promise<void> {
        const lobby = await this.lobbyRepository.findOne({ where: { id: lobbyId }, relations: ['owner'] });
        if (!lobby) {
            throw new Error("Lobby não encontrada.");
        }

        if (lobby.owner.id === userId) {
            // Dono exclui a lobby e remove todos os jogadores
            const players = await this.lobbyPlayersRepository.find({ where: { lobby: { id: lobbyId }, left_at: null } });
        
            for (const player of players) {
                player.left_at = new Date();
                await this.lobbyPlayersRepository.save(player);
            }
            lobby.isDeleted = true;
            await this.lobbyRepository.save(lobby);
            return;
        }

        // Jogador saindo
        const player = await this.lobbyPlayersRepository.findOne({ where: { lobby: { id: lobbyId }, character: { id: characterId }, left_at: null } });
        if (!player) {
            throw new Error("O personagem não está nesta lobby ativa.");
        }
        player.left_at = new Date();
        await this.lobbyPlayersRepository.save(player);
    }

    async kickPlayer(lobbyId: string, targetCharacterId: string, userId: string): Promise<void> {
        const lobby = await this.lobbyRepository.findOne({ where: { id: lobbyId }, relations: ['owner'] });

        if (lobby.owner.id !== userId) {
            throw new HttpException("Apenas o dono da lobby pode expulsar jogadores.", HttpStatus.FORBIDDEN);
        }

        const player = await this.lobbyPlayersRepository.findOne({
            where: { lobby: { id: lobbyId }, character: { id: targetCharacterId }, left_at: null },
        });

        if (!player) {
            throw new HttpException("O personagem não está nesta lobby.", HttpStatus.NOT_FOUND);
        }

        player.left_at = new Date();
        await this.lobbyPlayersRepository.save(player);

        // Impede o retorno por 3 minutos
        setTimeout(async () => {
            player.left_at = null;
            await this.lobbyPlayersRepository.save(player);
        }, 180000);
    }
}