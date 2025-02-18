import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { Injectable, NotFoundException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "../db/entities/Characters.entity";

@Injectable()
export class LobbyPlayersService {
  constructor(
    @InjectRepository(LobbyPlayer)
    private readonly lobbyPlayersRepository: Repository<LobbyPlayer>,

    @InjectRepository(Lobby)
    private readonly lobbyRepository: Repository<Lobby>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>
  ) {}

  async joinLobby(lobbyId: string, characterId: string, userId: string) {
    // Verifica se o usuário já é dono de uma lobby
    const ownedLobby = await this.lobbyRepository.findOne({ where: { owner: { id: userId }, isDeleted: false } });
    if (ownedLobby) {
      throw new HttpException('Você já possui uma lobby ativa como dono.', HttpStatus.FORBIDDEN);
    }

    // Verifica se o usuário já está em uma lobby
    const playerInLobby = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: IsNull() },
      relations: ['character', 'character.user'],
    });
    console.log("Resultado de playerInLobby:", playerInLobby);
    if (playerInLobby) {
      throw new HttpException('Você já está em uma lobby ativa como jogador.', HttpStatus.FORBIDDEN);
    }

    // Verifica se o personagem já está em outra lobby
    const characterInLobby = await this.lobbyPlayersRepository.findOne({
      where: { character: { id: characterId }, left_at: IsNull() },
    });
    if (characterInLobby) {
      throw new HttpException('Este personagem já está em uma lobby ativa.', HttpStatus.FORBIDDEN);
    }

    return this.lobbyPlayersRepository.save({
      lobby: { id: lobbyId },
      character: { id: characterId },
      joined_at: new Date(),
    });
  }

  async leaveLobby(lobbyId: string, characterId: string, userId: string): Promise<void> {
    const lobby = await this.lobbyRepository.findOne({ where: { id: lobbyId }, relations: ['owner'] });
    if (!lobby) {
      throw new NotFoundException("Lobby não encontrada.");
    }

    if (lobby.owner.id === userId) {
      // Se o usuário é o dono, expulsa todos os jogadores e deleta a lobby
      const players = await this.lobbyPlayersRepository.find({ where: { lobby: { id: lobbyId }, left_at: IsNull() } });
      for (const player of players) {
        player.left_at = new Date();
        await this.lobbyPlayersRepository.save(player);
      }
      lobby.isDeleted = true;
      await this.lobbyRepository.save(lobby);
      return;
    }

    // Se não é o dono, apenas marca que o usuário saiu da lobby
    const player = await this.lobbyPlayersRepository.findOne({ where: { lobby: { id: lobbyId }, character: { id: characterId }, left_at: IsNull() } });
    if (!player) {
      throw new NotFoundException("O personagem não está nesta lobby ativa.");
    }
    player.left_at = new Date();
    await this.lobbyPlayersRepository.save(player);
  }

  async leaveOrDeleteLobby(userId: string): Promise<void> {
    // Busca o registro de participação do usuário (jogador ativo)
    const player = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: IsNull() },
      relations: ['lobby', 'lobby.owner'],
    });

    if (!player) {
      throw new NotFoundException("Você não está em nenhuma lobby ativa.");
    }

    const lobby = player.lobby;
    if (!lobby) {
      throw new NotFoundException("Lobby não encontrada.");
    }

    if (lobby.owner.id === userId) {
      // Se o usuário é o dono, expulsa todos os jogadores e deleta a lobby
      await this.lobbyPlayersRepository
        .createQueryBuilder()
        .update()
        .set({ left_at: () => "CURRENT_TIMESTAMP" })
        .where("lobbyId = :lobbyId", { lobbyId: lobby.id })
        .andWhere("left_at IS NULL")
        .execute();

      lobby.isDeleted = true;
      await this.lobbyRepository.save(lobby);
    } else {
      // Se não é o dono, marca apenas que o usuário saiu da lobby
      player.left_at = new Date();
      await this.lobbyPlayersRepository.save(player);
    }
  }

  async kickPlayer(lobbyId: string, targetCharacterId: string, userId: string): Promise<void> {
    const lobby = await this.lobbyRepository.findOne({ where: { id: lobbyId }, relations: ['owner'] });
    if (lobby.owner.id !== userId) {
      throw new HttpException("Apenas o dono da lobby pode expulsar jogadores.", HttpStatus.FORBIDDEN);
    }
    const player = await this.lobbyPlayersRepository.findOne({
      where: { lobby: { id: lobbyId }, character: { id: targetCharacterId }, left_at: IsNull() },
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

  async getUserLobbyData(userId: string): Promise<{ lobby: Lobby, myCharacterId: string } | null> {
    // Tenta encontrar o registro de participação do usuário
    const playerInLobby = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: IsNull() },
      relations: [
        'lobby',
        'lobby.players',
        'lobby.players.character',
        'lobby.owner',
        'character',
        'character.user',
      ],
    });

    console.log("playerInLobby:", playerInLobby);

    if (playerInLobby) {
      const lobby = playerInLobby.lobby;
      if (lobby.isDeleted || !lobby.owner) {
        return null;
      }
      return { lobby, myCharacterId: playerInLobby.character.id };
    }

    // Se não encontrou o registro, tenta buscar uma lobby onde o usuário seja o dono
    const ownedLobby = await this.lobbyRepository.findOne({
      where: { owner: { id: userId }, isDeleted: false },
      relations: ['players', 'players.character', 'owner'],
    });
    if (ownedLobby) {
      const userPlayer = ownedLobby.players.find(
        (p) =>
          p.left_at === null &&
          p.character &&
          p.character.user &&
          p.character.user.id === userId
      );
      const myCharacterId = userPlayer?.character.id || "";
      return { lobby: ownedLobby, myCharacterId };
    }
    return null;
  }
}
