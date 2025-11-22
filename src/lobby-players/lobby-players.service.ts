import { LobbyGateway } from './../lobby/gateway';
import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { Injectable, NotFoundException, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository, LessThan, MoreThan } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "../db/entities/Characters.entity";
import { Cron } from "@nestjs/schedule";

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

    // ✅ CORREÇÃO 1: Verifica se foi kickado desta lobby e ainda está no cooldown
    const kickedFromThisLobby = await this.lobbyPlayersRepository.findOne({
      where: {
        lobby: { id: lobbyId },
        character: { id: characterId },
        kick_expires_at: MoreThan(new Date())
      }
    });

    if (kickedFromThisLobby) {
      const remainingSeconds = Math.ceil(
        (kickedFromThisLobby.kick_expires_at.getTime() - Date.now()) / 1000
      );
      throw new HttpException(
        `Você foi expulso desta lobby. Tente novamente em ${remainingSeconds}s.`,
        HttpStatus.FORBIDDEN
      );
    }

    // ✅ CORREÇÃO 2: Verifica se character já tem registro nesta lobby (mesmo com left_at)
    const existingEntry = await this.lobbyPlayersRepository.findOne({
      where: {
        lobby: { id: lobbyId },
        character: { id: characterId }
      }
    });

    // Se já existe entrada anterior, reativa ao invés de criar duplicada
    if (existingEntry) {
      if (!existingEntry.left_at && !existingEntry.kick_expires_at) {
        throw new HttpException('Você já está nesta lobby.', HttpStatus.BAD_REQUEST);
      }
      
      // Reativa entrada existente
      existingEntry.left_at = null;
      existingEntry.joined_at = new Date();
      existingEntry.kick_expires_at = null;
      existingEntry.kick_reason = null;
      const reactivatedPlayer = await this.lobbyPlayersRepository.save(existingEntry);

      // Emite eventos
      this.lobbyGateway.server.to(lobbyId).emit('playerJoined', reactivatedPlayer);
      this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
        lobbyId,
        action: 'playerJoined',
        newLobbyPlayer: reactivatedPlayer,
      });

      return reactivatedPlayer;
    }

    // ✅ CORREÇÃO 3: Validar capacidade da lobby
    const lobby = await this.lobbyRepository.findOne({
      where: { id: lobbyId },
      relations: ['players']
    });

    if (!lobby) {
      throw new NotFoundException('Lobby não encontrada.');
    }

    const activePlayers = lobby.players.filter(p => !p.left_at).length;
    if (activePlayers >= lobby.maxPlayers) {
      throw new HttpException(
        `Esta lobby está cheia (${activePlayers}/${lobby.maxPlayers}).`,
        HttpStatus.FORBIDDEN
      );
    }

    // ✅ CORREÇÃO 4: Validar nível do character
    const character = await this.characterRepository.findOne({
      where: { id: characterId }
    });

    if (!character) {
      throw new NotFoundException('Personagem não encontrado.');
    }

    if (character.level < lobby.minLevel || character.level > lobby.maxLevel) {
      throw new HttpException(
        `Seu nível ${character.level} não atende os requisitos desta lobby (nível ${lobby.minLevel}-${lobby.maxLevel}).`,
        HttpStatus.FORBIDDEN
      );
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
      player.kick_reason = 'left_voluntarily';
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
    // Marca o jogador como expulso e define quando o kick expira (3 minutos)
    player.left_at = new Date();
    player.kick_expires_at = new Date(Date.now() + 180000); // +3 minutos
    player.kick_reason = 'kicked_by_owner';
    await this.lobbyPlayersRepository.save(player);
  
    // Emite um evento para a room da lobby informando que o jogador foi expulso
    this.lobbyGateway.server.to(lobbyId).emit('playerKicked', { targetCharacterId });
    // Atualiza a room global de lobbies
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
      lobbyId,
      action: 'playerKicked',
      targetCharacterId,
    });
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

  /**
   * Cron job que executa a cada 1 minuto para limpar kicks expirados
   * Restaura left_at e kick_expires_at quando o tempo de cooldown expira
   */
  @Cron('* * * * *') // Executa a cada minuto
  async cleanExpiredKicks() {
    const expiredKicks = await this.lobbyPlayersRepository.find({
      where: { 
        kick_expires_at: LessThan(new Date())
      },
      relations: ['lobby', 'character']
    });

    if (expiredKicks.length > 0) {
      for (const player of expiredKicks) {
        player.left_at = null;
        player.kick_expires_at = null;
        player.kick_reason = null;
        await this.lobbyPlayersRepository.save(player);

        // Emite evento informando que o kick expirou
        this.lobbyGateway.server.to(player.lobby.id).emit('kickExpired', { 
          targetCharacterId: player.character.id 
        });
        this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
          lobbyId: player.lobby.id,
          action: 'kickExpired',
          targetCharacterId: player.character.id,
        });
      }

      console.log(`[Cron] ${expiredKicks.length} kicks expirados foram limpos`);
    }
  }
}
