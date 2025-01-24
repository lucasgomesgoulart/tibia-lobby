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

    async createLobby(dto: LobbyDto): Promise<Lobby> {
        if (Array.isArray(dto)) {
            throw new Error("Erro: O payload deve ser um único objeto, não um array.");
        }

        // 🔹 Verifica se o usuário existe
        const user = await this.userRepository.findOne({ where: { id: dto.ownerId } });
        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        // 🔹 Criando a lobby sem espalhar `dto`
        const newLobby = this.lobbyRepository.create({
            id: uuid(),
            title: dto.title,
            minLevel: dto.minLevel,
            maxLevel: dto.maxLevel,
            maxPlayers: dto.maxPlayers,
            minPlayers: dto.minPlayers,
            activityType: dto.activityType,
            discordChannelLink: dto.discordChannelLink,
            owner: user, // 🔹 O TypeORM precisa de um objeto `User`, não de um `string`
        });

        const savedLobby = await this.lobbyRepository.save(newLobby);

        // 🔹 Adiciona o dono da lobby como primeiro jogador na `lobby_players`
        const lobbyPlayer = this.lobbyPlayerRepository.create({
            id: uuid(),
            user: user,
            lobby: savedLobby,
        });

        await this.lobbyPlayerRepository.save(lobbyPlayer);

        return savedLobby;
    }
}