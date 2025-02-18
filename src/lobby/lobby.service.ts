import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { User } from "../db/entities/user.entity";
import { FindAllParameters, LobbyDto } from "../lobby/lobby.dto";
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
  ) {}

  async createLobby(lobbyToCreate: LobbyDto, userId: string, characterId: string): Promise<Lobby> {
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
      throw new ForbiddenException("Você já possui uma lobby ativa. Exclua a anterior antes de criar uma nova.");
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
    });
    if (!lobby) {
      throw new NotFoundException("Lobby não encontrada.");
    }
    if (lobby.isDeleted) {
      throw new NotFoundException("Não é possível editar uma lobby deletada");
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
    });
    await this.lobbyRepository.save(lobby);
  }

  async getAllLobbies(filters: Partial<FindAllParameters>): Promise<any[]> {
    const queryBuilder = this.lobbyRepository.createQueryBuilder("lobby")
      .leftJoinAndSelect("lobby.owner", "owner")
      // Traz somente os jogadores ativos (left_at IS NULL)
      .leftJoinAndSelect("lobby.players", "players", "players.left_at IS NULL")
      .leftJoinAndSelect("players.character", "character")
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

    const lobbies = await queryBuilder.getMany();
    const filteredLobbies = lobbies.filter(lobby => {
      const activePlayersCount = lobby.players.length;
      if (filters.minPlayers !== undefined && activePlayersCount < filters.minPlayers) {
        return false;
      }
      if (filters.maxPlayers !== undefined && activePlayersCount > filters.maxPlayers) {
        return false;
      }
      return true;
    });
    return filteredLobbies.map(lobby => {
      const activePlayers = lobby.players;
      const vocations = activePlayers.map(player => player.character?.vocation);
      return {
        ...lobby,
        activePlayersCount: activePlayers.length,
        vocations: vocations,
      };
    });
  }
}
