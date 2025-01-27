import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";
import { User } from "../db/entities/user.entity";
import { LobbyDto } from "../lobby/lobby.dto";
import { v4 as uuid } from "uuid";

@Injectable()
export class LobbyService {
    constructor(
        @InjectRepository(Lobby) 
        private readonly lobbyRepository: Repository<Lobby>,

        @InjectRepository(LobbyPlayer) 
        private readonly lobbyPlayerRepository: Repository<LobbyPlayer>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async createLobby(lobbyToCreate: LobbyDto): Promise<Lobby> {
    
        // const validaSeTemLobbyCriada = await this.lobbyPlayerRepository.find(lobbyToCreate.ownerId);

        const user = await this.userRepository.findOne({ where: { id: lobbyToCreate.ownerId } });
        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        const newLobby = this.lobbyRepository.create({
            id: uuid(),
            title: lobbyToCreate.title,
            minLevel: lobbyToCreate.minLevel,
            maxLevel: lobbyToCreate.maxLevel,
            maxPlayers: lobbyToCreate.maxPlayers,
            minPlayers: lobbyToCreate.minPlayers,
            activityType: lobbyToCreate.activityType,
            discordChannelLink: lobbyToCreate.discordChannelLink,
            owner: user, 
        });

        const savedLobby = await this.lobbyRepository.save(newLobby);

        const lobbyPlayer = this.lobbyPlayerRepository.create({
            id: uuid(),
            user: user,
            lobby: savedLobby,
        });

        await this.lobbyPlayerRepository.save(lobbyPlayer);

        return savedLobby;
    }
}