import { LobbyGateway } from './../lobby/gateway';
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
    private readonly characterRepository: Repository<Character>,

    private readonly lobbyGateway: LobbyGateway
  ) {}

  async joinLobby(lobbyId: string, characterId: string, userId: string) {
    // Verifica se o usuário já possui uma lobby ativa como dono
    const ownedLobby = await this.lobbyRepository.findOne({ where: { owner: { id: userId }, isDeleted: false } });
    if (ownedLobby) {
      throw new HttpException('Você já possui uma lobby ativa como dono.', HttpStatus.FORBIDDEN);
    }
  
    // Verifica se o usuário já está em uma lobby ativa como jogador
    const playerInLobby = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: IsNull() },
      relations: ['character', 'character.user'],
    });
    if (playerInLobby) {
      throw new HttpException('Você já está em uma lobby ativa como jogador.', HttpStatus.FORBIDDEN);
    }
  
    // Verifica se o personagem já está em uma lobby ativa
    const characterInLobby = await this.lobbyPlayersRepository.findOne({
      where: { character: { id: characterId }, left_at: IsNull() },
    });
    if (characterInLobby) {
      throw new HttpException('Este personagem já está em uma lobby ativa.', HttpStatus.FORBIDDEN);
    }
  
    // Salva o registro de entrada na lobby
    const newLobbyPlayer = await this.lobbyPlayersRepository.save({
      lobby: { id: lobbyId },
      character: { id: characterId },
      joined_at: new Date(),
    });
  
    // Emite um evento para a room específica da lobby indicando que um novo jogador entrou
    this.lobbyGateway.server.to(lobbyId).emit('playerJoined', newLobbyPlayer);
  
    // Opcional: Se você também tiver uma room global para a listagem de lobbies (ex.: "lobbyList"),
    // emita um evento para atualizar a lista geral
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
      lobbyId,
      action: 'playerJoined',
      newLobbyPlayer,
    });
  
    return newLobbyPlayer;
  }

  async leaveOrDeleteLobby(userId: string): Promise<void> {
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
      // Se o dono está excluindo a lobby, marca todos os jogadores como saídos
      await this.lobbyPlayersRepository
        .createQueryBuilder()
        .update()
        .set({ left_at: () => "CURRENT_TIMESTAMP" })
        .where("lobbyId = :lobbyId", { lobbyId: lobby.id })
        .andWhere("left_at IS NULL")
        .execute();
  
      lobby.isDeleted = true;
      await this.lobbyRepository.save(lobby);
  
      // Remove todos os sockets que estão na room da lobby
      this.lobbyGateway.server.in(lobby.id).socketsLeave(lobby.id);
      // Emite evento global para atualizar a listagem
      this.lobbyGateway.server.emit('lobbyDeleted', { lobbyId: lobby.id });
    } else {
      // Se não for o dono, apenas marca o jogador como saiu
      player.left_at = new Date();
      await this.lobbyPlayersRepository.save(player);
  
      // Aqui, se você tiver um mapeamento de socket por usuário, remova somente o socket do usuário que saiu.
      // Caso contrário, você pode emitir um evento para que o cliente se desconecte da room.
      this.lobbyGateway.server.to(lobby.id).emit('playerLeft', { characterId: player.character.id });
      this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
        lobbyId: lobby.id,
        action: 'playerLeft',
        characterId: player.character.id,
      });
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
    // Marca o jogador como expulso
    player.left_at = new Date();
    await this.lobbyPlayersRepository.save(player);
  
    // Emite um evento para a room da lobby informando que o jogador foi expulso
    this.lobbyGateway.server.to(lobbyId).emit('playerKicked', { targetCharacterId });
    // Atualiza a room global de lobbies
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
      lobbyId,
      action: 'playerKicked',
      targetCharacterId,
    });
  
    // Após 3 minutos, permite que o jogador retorne (kick expira)
    setTimeout(async () => {
      player.left_at = null;
      await this.lobbyPlayersRepository.save(player);
  
      this.lobbyGateway.server.to(lobbyId).emit('kickExpired', { targetCharacterId });
      this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
        lobbyId,
        action: 'kickExpired',
        targetCharacterId,
      });
    }, 180000);
  }
  
  

  async getUserLobbyData(userId: string): Promise<{ lobby: Lobby, myCharacterId: string } | null> {
    
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

    if (playerInLobby) {
      const lobby = playerInLobby.lobby;
      if (lobby.isDeleted || !lobby.owner) {
        return null;
      }
      return { lobby, myCharacterId: playerInLobby.character.id };
    }

    
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
