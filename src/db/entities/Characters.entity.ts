import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { World } from "./world.entity";
import { OtServer } from "./otserver.entity";
import { IsUUID } from "class-validator";

export enum ServerType {
    GLOBAL = "GLOBAL",
    OTSERVER = "OTSERVER",
}

export enum Vocations {
    DRUID = "DRUID",
    SORCERER = "SORCERER",
    KNIGHT = "KNIGHT",
    PALADIN = "PALADIN"
}

@Entity("characters")
export class Character {
    @PrimaryGeneratedColumn("uuid")
    
    id: string;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: ServerType,
    })
    serverType: ServerType;

    @ManyToOne(() => World, { nullable: true }) 
    world?: World;

    @ManyToOne(() => OtServer, { nullable: true }) 
    otServer?: OtServer; 

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
