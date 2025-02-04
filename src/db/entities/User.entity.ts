import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany
} from "typeorm";
import { Lobby } from "./Lobby.entity";
import { Character } from "./Characters.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: true })
    full_name: string;

    @Column({ type: "date", nullable: true })
    birth_date: Date;

    @Column({ nullable: true })
    phone: string;


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

    @OneToMany(() => Lobby, (lobby) => lobby.owner)
    lobbiesOwned: Lobby[];


    @OneToMany(() => Character, (character) => character.user)
    characters: Character[];
}
