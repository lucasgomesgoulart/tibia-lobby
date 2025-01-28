import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";
import { User } from "./user.entity";
import { Lobby } from "./lobby.entity";

@Entity("lobby_players")
export class LobbyPlayer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Lobby)
    lobby: Lobby;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
