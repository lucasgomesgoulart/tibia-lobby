import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

export enum ServerType {
    GLOBAL = "GLOBAL",
    OTSERVER = "OTSERVER",
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

    @Column({ nullable: true }) // 🔹 Se for GLOBAL, terá um mundo
    world: string;

    @Column({ nullable: true }) // 🔹 Se for OTSERVER, terá um servidor OT
    otServer: string;

    @Column()
    vocation: string;

    @Column({ nullable: true }) // 🔹 O nível será atualizado depois
    level: number;

    @ManyToOne(() => User, (user) => user.characters, { onDelete: "CASCADE" })
    user: User;
}
