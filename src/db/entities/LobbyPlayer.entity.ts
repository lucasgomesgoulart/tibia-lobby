import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from "typeorm";
import { User } from "./User.entity";
import { Lobby } from "./Lobby.entity";

@Entity("lobby_players")
export class LobbyPlayer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, (user) => user.lobbiesJoined)
    user: User;

    @ManyToOne(() => Lobby, (lobby) => lobby.players)
    lobby: Lobby;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;
}
