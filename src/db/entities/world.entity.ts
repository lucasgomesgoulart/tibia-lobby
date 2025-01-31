import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { OtServer } from "./otserver.entity";

@Entity("worlds")
export class World {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ default: true })
    isGlobal: boolean;

    @ManyToOne(() => OtServer, (otServer) => otServer.worlds, { nullable: true, onDelete: "CASCADE" })
    otServer?: OtServer;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
