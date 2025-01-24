import { 
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn 
} from "typeorm";
import { User } from "./User.entity"
import { LobbyPlayer } from "./LobbyPlayer.entity";

export enum ActivityType {
    PVP = "PVP",
    HUNT = "HUNT",
    QUEST = "QUEST",
    BOSS = "BOSS",
    WAR = "WAR",
    EVENT = "EVENT",
}

@Entity("lobbies")
export class Lobby {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column()
    minLevel: number;

    @Column()
    maxLevel: number;

    @Column()
    maxPlayers: number;

    @Column()
    minPlayers: number;

    @Column({
        type: "enum",
        enum: ActivityType,
    })
    activityType: ActivityType;

    // 🔹 Dono do lobby (Usuário que criou)
    @ManyToOne(() => User, (user) => user.lobbiesOwned)
    owner: User;

    // 🔹 Lista de jogadores na lobby
    @OneToMany(() => LobbyPlayer, (lobbyPlayer) => lobbyPlayer.lobby)
    players: LobbyPlayer[];

    @Column()
    discordChannelLink: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
