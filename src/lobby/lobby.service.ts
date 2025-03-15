import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityType } from 'src/db/entities/activityType';
import { Character } from 'src/db/entities/Characters.entity';
import { Lobby } from 'src/db/entities/lobby.entity';
import { LobbyPlayer } from 'src/db/entities/LobbyPlayer.entity';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { FilterLobbiesDto } from './filter-lobbies.dto';
import { CreateLobbyDto } from './createLobby.dto';


@Injectable()
export class LobbiesService {
  constructor(
    @InjectRepository(Lobby)
    private lobbyRepository: Repository<Lobby>,

    @InjectRepository(LobbyPlayer)
    private lobbyPlayerRepository: Repository<LobbyPlayer>,

    @InjectRepository(Character)
    private characterRepository: Repository<Character>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ActivityType)
    private activityTypeRepository: Repository<ActivityType>,
  ) {}

  // Listagem de lobbies ativas com joins para trazer os players e owner
  async findLobbies(filter: FilterLobbiesDto): Promise<Lobby[]> {
    const query = this.lobbyRepository.createQueryBuilder('lobby')
      .leftJoinAndSelect('lobby.players', 'players')
      .leftJoinAndSelect('players.character', 'character')
      .leftJoinAndSelect('lobby.owner', 'owner')
      .where('lobby.isDeleted = false');

    if (filter.title) {
      query.andWhere('lobby.title ILIKE :title', { title: `%${filter.title}%` });
    }
    if (filter.activityTypeId) {
      query.andWhere('lobby.activityType = :activityTypeId', { activityTypeId: filter.activityTypeId });
    }
    if (filter.minLevel) {
      query.andWhere('lobby.minLevel >= :minLevel', { minLevel: filter.minLevel });
    }
    if (filter.maxLevel) {
      query.andWhere('lobby.maxLevel <= :maxLevel', { maxLevel: filter.maxLevel });
    }
    if (filter.skip) {
      query.skip(filter.skip);
    }
    if (filter.take) {
      query.take(filter.take);
    }

    return query.getMany();
  }

  // Retorna a lobby ativa do usuário, se houver
  async getUserLobbyData(userId: string): Promise<{ lobby: Lobby; myCharacterId: string } | null> {
    const playerInLobby = await this.lobbyPlayerRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: null },
      relations: [
        'lobby',
        'lobby.players',
        'lobby.players.character',
        'lobby.owner',
        'character',
        'character.user',
      ],
    });
    if (playerInLobby) {
      const lobby = playerInLobby.lobby;
      if (lobby.isDeleted || !lobby.owner) {
        return null;
      }
      return { lobby, myCharacterId: playerInLobby.character.id };
    }

    // Se o usuário é dono, mas não há registro em lobby_players (ex.: só o owner sem registro em lobby_players)
    const ownedLobby = await this.lobbyRepository.findOne({
      where: { owner: { id: userId }, isDeleted: false },
      relations: ['players', 'players.character', 'owner'],
    });
    if (ownedLobby) {
      const userPlayer = ownedLobby.players.find(
        (p) => p.left_at === null && p.character && p.character.user && p.character.user.id === userId
      );
      const myCharacterId = userPlayer?.character.id || "";
      return { lobby: ownedLobby, myCharacterId };
    }
    return null;
  }

  // Criação de nova lobby
  async createLobby(userId: string, createLobbyDto: CreateLobbyDto): Promise<Lobby> {
    // Recupera o usuário com seus characters
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['characters'] });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Verifica se o usuário já possui uma lobby ativa
    const existingLobby = await this.lobbyRepository.findOne({ where: { owner: { id: userId }, isDeleted: false } });
    if (existingLobby) {
      throw new BadRequestException('Você já possui uma lobby ativa.');
    }

    // Verifica se o character informado pertence ao usuário
    const character = await this.characterRepository.findOne({
      where: { id: createLobbyDto.characterId },
      relations: ['user'],
    });
    if (!character || character.user.id !== userId) {
      throw new BadRequestException('Character inválido ou não pertence ao usuário.');
    }

    // Verifica se algum dos characters do usuário já está em uma lobby ativa
    const userCharacterIds = user.characters.map((char) => char.id);
    const activeParticipation = await this.lobbyPlayerRepository.createQueryBuilder('lp')
      .innerJoinAndSelect('lp.lobby', 'lobby')
      .where('lp.characterId IN (:...ids)', { ids: userCharacterIds })
      .andWhere('lp.left_at IS NULL')
      .andWhere('lobby.isDeleted = :active', { active: false })
      .getOne();

    if (activeParticipation) {
      throw new BadRequestException('Um dos seus characters já está participando de uma lobby ativa.');
    }

    // Busca o tipo de atividade usando o ID informado
    const activityType = await this.activityTypeRepository.findOne({ where: { id: createLobbyDto.activityTypeId } });
    if (!activityType) {
      throw new BadRequestException('Tipo de atividade inválido.');
    }

    // Cria a lobby usando a relação com a entidade ActivityType
    const lobby = this.lobbyRepository.create({
      title: createLobbyDto.title,
      minLevel: createLobbyDto.minLevel,
      maxLevel: createLobbyDto.maxLevel,
      minPlayers: createLobbyDto.minPlayers,
      maxPlayers: createLobbyDto.maxPlayers,
      activityType: activityType,
      discordChannelLink: createLobbyDto.discordChannelLink,
      owner: user,
      ...(createLobbyDto.description && { description: createLobbyDto.description }),
    });

    const savedLobby = await this.lobbyRepository.save(lobby);

    // Registra o character do usuário como participante e líder da lobby
    const lobbyPlayer = this.lobbyPlayerRepository.create({
      lobby: savedLobby,
      character: character,
      isLeader: true,
    });
    await this.lobbyPlayerRepository.save(lobbyPlayer);

    return savedLobby;
  }
}
