import { Type } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum ServerType {
    GLOBAL = "GLOBAL",
    OTSERVER = "OTSERVER",
}

export enum Vocations {
    "DRUID",
    "SORCERER",
    "KNIGHT",
    "PALADIN"
}

@Entity("characters")
export class Character {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: ServerType,
    })
    serverType: ServerType;
    

    @Column({ nullable: true })
    world: string;

    @Column({ nullable: true })
    otServer: string;

    @Column({
        type: "enum",
        enum: Vocations,
    })
    vocation: Vocations;

    @Column({ nullable: true })
    level: number;

    @ManyToOne(() => User, (user) => user.characters, { onDelete: "CASCADE" })
    user: User;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;


}
