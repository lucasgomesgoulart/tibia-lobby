import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LobbyPlayer } from "../db/entities/LobbyPlayer.entity";
import { Lobby } from "../db/entities/Lobby.entity";
import { User } from "../db/entities/User.entity";

@Injectable()
export class LobbyPlayersService {
  constructor(
    @InjectRepository(LobbyPlayer)
    private readonly lobbyPlayerRepo: Repository<LobbyPlayer>,

    @InjectRepository(Lobby)
    private readonly lobbyRepo: Repository<Lobby>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) { }

  // ✅ Usuário entra no lobby
  async joinLobby(userId: string, lobbyId: string): Promise<LobbyPlayer> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("Usuário não encontrado");

    const lobby = await this.lobbyRepo.findOne({ where: { id: lobbyId } });
    if (!lobby) throw new NotFoundException("Lobby não encontrada");

    const existingPlayer = await this.lobbyPlayerRepo.findOne({ where: { user: { id: userId } } });
    if (existingPlayer) throw new BadRequestException("Usuário já está em um lobby");

    const newLobbyPlayer = this.lobbyPlayerRepo.create({ user, lobby });
    return this.lobbyPlayerRepo.save(newLobbyPlayer);
  }

  // ✅ Usuário sai do lobby
  async leaveLobby(userId: string): Promise<void> {
    const player = await this.lobbyPlayerRepo.findOne({ where: { user: { id: userId } } });
    if (!player) throw new NotFoundException("Usuário não está em nenhum lobby");

    await this.lobbyPlayerRepo.softRemove(player);
  }
}
