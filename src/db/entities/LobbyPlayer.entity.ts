import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Column } from "typeorm";
import { Lobby } from "./lobby.entity";
import { Character } from "./characters.entity";

@Entity("lobby_players")
export class LobbyPlayer {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Lobby, (lobby) => lobby.players, { onDelete: "CASCADE" })
    lobby: Lobby;

    @ManyToOne(() => Character, { onDelete: "CASCADE" })
    character: Character;

    @CreateDateColumn()
    joined_at: Date;

    @Column({default: null })
    left_at: Date;

    @Column({ nullable: true })
    kick_expires_at: Date;

    @Column({ nullable: true })
    kick_reason: string;

    @Column({default: false})
    isLeader: boolean;
}
