import { LobbyPlayer } from "src/db/entities/LobbyPlayer.entity";
import { Injectable, NotFoundException, HttpException, HttpStatus, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Lobby } from "../db/entities/lobby.entity";
import { User } from "../db/entities/user.entity";
import { Character } from "../db/entities/Characters.entity";
import { LobbyGateway } from "src/lobby/gateway";

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

  async joinLobby(lobbyId: string, characterId: string, userId: string): Promise<LobbyPlayer> {
    // Verifica se o usuário já possui uma lobby ativa como dono
    const ownedLobby = await this.lobbyRepository.findOne({ 
      where: { owner: { id: userId }, isDeleted: false } 
    });
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
  
    // Após salvar, carregue o registro atualizado com os dados completos da lobby e seus relacionamentos.
    const updatedLobbyPlayer = await this.lobbyPlayersRepository.findOne({
      where: { id: newLobbyPlayer.id },
      relations: ['lobby', 'lobby.players', 'lobby.owner', 'character', 'character.user'],
    });
  
    if (!updatedLobbyPlayer) {
      throw new NotFoundException('Erro ao carregar os dados atualizados da lobby.');
    }
  
    // Emite eventos para a sala da lobby e a room global para atualizar a listagem
    this.lobbyGateway.server.to(lobbyId).emit('playerJoined', updatedLobbyPlayer);
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', {
      lobbyId,
      action: 'playerJoined',
      newLobbyPlayer: updatedLobbyPlayer,
    });
  
    return updatedLobbyPlayer;
  }

  async exitLobby(userId: string): Promise<void> {
    // Busca o registro de LobbyPlayer ativo para o usuário
    const player = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: null },
      relations: ['lobby', 'character'],
    });
    
    if (!player) {
      throw new NotFoundException("Você não está em nenhuma lobby ativa.");
    }
    
    // Se o usuário for owner, a saída deve ser feita pelo método de exclusão, não por esse endpoint.
    if (player.lobby.owner.id === userId) {
      throw new BadRequestException("O dono da lobby não pode sair usando esse endpoint. Utilize a opção de excluir a lobby.");
    }
    
    // Marca o jogador como saiu
    player.left_at = new Date();
    await this.lobbyPlayersRepository.save(player);
    
    // Emite eventos para notificar a saída do jogador
    this.lobbyGateway.server.to(player.lobby.id).emit('playerLeft', { characterId: player.character.id });
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', { lobbyId: player.lobby.id, action: 'playerLeft', characterId: player.character.id });
  }

  async deleteLobby(userId: string): Promise<void> {
    // Busca o registro de LobbyPlayer ativo para o owner
    const player = await this.lobbyPlayersRepository.findOne({
      where: { character: { user: { id: userId } }, left_at: null },
      relations: ['lobby', 'lobby.owner'],
    });
    
    if (!player) {
      throw new NotFoundException("Você não está em nenhuma lobby ativa.");
    }
    
    const lobby = player.lobby;
    
    if (lobby.owner.id !== userId) {
      throw new BadRequestException("Apenas o dono da lobby pode excluí-la.");
    }
    
    // Marca todos os jogadores ativos na lobby como tendo saído
    await this.lobbyPlayersRepository
      .createQueryBuilder()
      .update()
      .set({ left_at: () => "CURRENT_TIMESTAMP" })
      .where("lobby.id = :lobbyId", { lobbyId: lobby.id })
      .andWhere("left_at IS NULL")
      .execute();
    
    // Marca a lobby como deletada
    lobby.isDeleted = true;
    await this.lobbyRepository.save(lobby);
    
    // Emite eventos via gateway para notificar a exclusão da lobby
    this.lobbyGateway.server.to(lobby.id).emit('lobbyDeleted', { lobbyId: lobby.id });
    // Opcional: Notifica a lista global de lobbies
    this.lobbyGateway.server.to('lobbyList').emit('lobbyUpdated', { lobbyId: lobby.id, action: 'deleted' });
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
