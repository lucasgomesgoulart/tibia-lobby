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
        enum: ["PVP", "HUNT", "QUEST", "BOSS", "WAR", "EVENT"], // 🔹 Certifique-se que o enum está correto
    })
    activityType: string;

    @ManyToOne(() => User, (user) => user.lobbiesOwned)
    owner: User;

    @OneToMany(() => LobbyPlayer, (lobbyPlayer) => lobbyPlayer.lobby, { cascade: true }) // 🔹 Corrija a relação aqui
    players: LobbyPlayer[];

    @Column()
    discordChannelLink: string;

    @Column({default: false})
    isDeleted: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}