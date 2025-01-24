import { 
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany 
} from "typeorm";
import { Lobby } from "./Lobby.entity";
import { LobbyPlayer } from "./LobbyPlayer.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    full_name: string;

    @Column({ type: "date", nullable: true })
    birth_date: Date;

    @Column({ nullable: true })
    phone: string;

    // Endereço
    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    zip_code: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    address_2: string;

    // Segurança e Controle
    @Column({ default: "user" })
    role: string;

    @Column({ default: "active" })
    status: string;

    @Column({ type: "timestamp", nullable: true })
    last_login: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // 🔹 Relação: Usuário pode criar várias lobbies
    @OneToMany(() => Lobby, (lobby) => lobby.owner)
    lobbiesOwned: Lobby[];

    // 🔹 Relação: Usuário pode estar em apenas uma lobby por vez
    @OneToMany(() => LobbyPlayer, (lobbyPlayer) => lobbyPlayer.user)
    lobbiesJoined: LobbyPlayer[];
}
