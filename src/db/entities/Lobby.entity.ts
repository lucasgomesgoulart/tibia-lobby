import { 
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn 
} from "typeorm";
import { User } from "./User.entity";
import { LobbyPlayer } from "./LobbyPlayer.entity";
import { ActivityType } from "./activityType";


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

    @ManyToOne(() => ActivityType, { nullable: true })
    @JoinColumn({ name: 'activityTypeId' })
    activityType?: ActivityType;

    @ManyToOne(() => User, (user) => user.lobbiesOwned)
    owner?: User;

    @OneToMany(() => LobbyPlayer, (lobbyPlayer) => lobbyPlayer.lobby, { cascade: true }) 
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