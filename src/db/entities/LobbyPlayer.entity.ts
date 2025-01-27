import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Lobby } from "./lobby.entity";

@Entity("lobby_players")
export class LobbyPlayer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.lobbiesJoined, { onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Lobby, (lobby) => lobby.players, { onDelete: "CASCADE" }) // 🔹 Confirme que a relação está correta
    lobby: Lobby;

    @CreateDateColumn()
    created_at: Date;
}
