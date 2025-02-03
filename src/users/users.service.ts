import { hashSync as bcryptHashSync } from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../db/entities/user.entity";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async createUser(newUser: Partial<User>): Promise<User> {

        const usernameFound = await this.userRepository.findOne({
            where: { username: newUser.username },
        });

        const emailFound = await this.userRepository.findOne({
            where: { email: newUser.email },
        });

        if (usernameFound) {
            throw new Error("Username already exists");
        }

        if (emailFound) {
            throw new Error("Email already exists");
        }

        const user = this.userRepository.create({
            ...newUser,
            id: uuid(),
            password: bcryptHashSync(newUser.password, 10),
        });

        return this.userRepository.save(user);
    }
    async findUserByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }
}