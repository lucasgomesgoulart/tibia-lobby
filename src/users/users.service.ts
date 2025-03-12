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
            throw new Error;
        }

        if (emailFound) {
            throw new Error("Email já está sendo usado.");
        }

        const user = this.userRepository.create({
            ...newUser,
            id: uuid(),
            password: bcryptHashSync(newUser.password, 10),
        });

        return this.userRepository.save(user);
    }

    async updateUser(id: string, userToUpdate: Partial<User>): Promise<User>  {
        try {
            const user = await this.userRepository.findOneBy({id})
            if (!user) {
                throw new Error("User not found");
            }

            const updatedUser = {...user, ...userToUpdate}
            return await this.userRepository.save(updatedUser);
        } catch (error) {
            throw new Error(error.message || "Erro ao atualizar usuário")
        }
    }
    
    async findUserByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }

    async getUserInfo(id: string): Promise<User | null> {
        const response =  await this.userRepository.findOne({ where: { id } });
        console.log(response)
        return response
    }
}