import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { User } from "../db/entities/user.entity";
import { FindAllParameters, LobbyDto } from "../lobby/lobby.dto";
import { v4 as uuid } from "uuid";
import { Character } from "src/db/entities/Characters.entity";

@Injectable()
export class LobbyService {
    constructor(
        @InjectRepository(Lobby)
        private readonly lobbyRepository: Repository<Lobby>,

        @InjectRepository(LobbyPlayer)
        private readonly lobbyPlayerRepository: Repository<LobbyPlayer>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Character)
        private readonly characterRepository: Repository<Character>
    ) { }

    async createLobby(lobbyToCreate: LobbyDto, userId: string, characterId: string): Promise<Lobby> {
        console.log(userId);


        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }


        const character = await this.characterRepository.findOne({
            where: { id: characterId, user: { id: userId } },
            relations: ["user"],
        });

        if (!character) {
            throw new NotFoundException("Personagem não encontrado ou não pertence ao usuário.");
        }


        const activeLobby = await this.lobbyRepository.findOne({
            where: { owner: { id: userId }, isDeleted: false },
        });

        if (activeLobby) {
            throw new ForbiddenException("Você já tem uma lobby ativa. Delete a anterior antes de criar outra.");
        }


        const newLobby = this.lobbyRepository.create({
            title: lobbyToCreate.title,
            minLevel: lobbyToCreate.minLevel,
            maxLevel: lobbyToCreate.maxLevel,
            maxPlayers: lobbyToCreate.maxPlayers,
            minPlayers: lobbyToCreate.minPlayers,
            activityType: lobbyToCreate.activityType,
            discordChannelLink: lobbyToCreate.discordChannelLink,
            owner: user,
            isDeleted: false,
        });

        const savedLobby = await this.lobbyRepository.save(newLobby);


        const lobbyPlayer = this.lobbyPlayerRepository.create({
            character: character,
            lobby: savedLobby,
        });

        await this.lobbyPlayerRepository.save(lobbyPlayer);

        return savedLobby;
    }


    async updateLobby(lobbyToUpdate: LobbyDto, userId: string, lobbyId: string): Promise<void> {
        const lobby = await this.lobbyRepository.findOne({
            where: { id: lobbyId },
            relations: ['owner'],
        })

        console.log(lobby)
        if (!lobby) {
            throw new NotFoundException("Lobby não encontrada.");
        }

        if (lobby.isDeleted) {
            throw new NotFoundException("Não é possivel editar uma lobby deleteda")
        }

        if (lobby.owner.id != userId) {
            throw new ForbiddenException("Você não possui permissão para editar essa lobby.");
        }

        Object.assign(lobby, {
            title: lobbyToUpdate.title ?? lobby.title,
            minLevel: lobbyToUpdate.minLevel ?? lobby.minLevel,
            maxLevel: lobbyToUpdate.maxLevel ?? lobby.maxLevel,
            maxPlayers: lobbyToUpdate.maxPlayers ?? lobby.maxPlayers,
            minPlayers: lobbyToUpdate.minPlayers ?? lobby.minPlayers,
            activityType: lobbyToUpdate.activityType ?? lobby.activityType,
            discordChannelLink: lobbyToUpdate.discordChannelLink ?? lobby.discordChannelLink,
        })

        await this.lobbyRepository.save(lobby);

    }

    async deleteLobby(lobbyId: string, userId: string): Promise<void> {

        const lobby = await this.lobbyRepository.findOne({
            where: { id: lobbyId },
            relations: ["owner"],
        });

        if (!lobby) {
            throw new NotFoundException("Lobby não encontrada.");
        }


        if (lobby.owner.id !== userId) {
            throw new ForbiddenException("Você não tem permissão para deletar esta lobby.");
        }


        lobby.isDeleted = true;
        await this.lobbyRepository.save(lobby);
    }

    async getAllLobbies(filters: Partial<FindAllParameters>): Promise<Lobby[]> {
        const queryBuilder = this.lobbyRepository.createQueryBuilder("lobby")
            .leftJoinAndSelect("lobby.owner", "owner")
            .leftJoinAndSelect("lobby.players", "players")
            .where("lobby.isDeleted = false");

        if (filters.title) {
            queryBuilder.andWhere("LOWER(lobby.title) LIKE LOWER(:title)", { title: `%${filters.title}%` });
        }

        if (filters.activityType) {
            queryBuilder.andWhere("lobby.activityType = :activityType", { activityType: filters.activityType });
        }

        if (filters.minLevel) {
            queryBuilder.andWhere("lobby.minLevel >= :minLevel", { minLevel: filters.minLevel });
        }

        if (filters.maxLevel) {
            queryBuilder.andWhere("lobby.maxLevel <= :maxLevel", { maxLevel: filters.maxLevel });
        }

        if (filters.ownerId) {
            queryBuilder.andWhere("lobby.ownerId = :ownerId", { ownerId: filters.ownerId });
        }

        return await queryBuilder.getMany();
    }
}
