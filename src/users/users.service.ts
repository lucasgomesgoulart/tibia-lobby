import { hashSync as bcryptHashSync } from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../db/entities/user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(newUser: CreateUserDto): Promise<User> {
    const usernameFound = await this.userRepository.findOne({
      where: { username: newUser.username },
    });

    const emailFound = await this.userRepository.findOne({
      where: { email: newUser.email },
    });

    if (usernameFound) {
      throw new BadRequestException('Nome de usuário já está em uso.');
    }

    if (emailFound) {
      throw new BadRequestException('Email já está sendo usado.');
    }

    const user = this.userRepository.create({
      ...newUser,
      id: uuid(),
      password: bcryptHashSync(newUser.password, 10),
    });

    return this.userRepository.save(user);
  }

  async updateUser(id: string, userToUpdate: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // Faça o merge dos dados existentes com os novos, garantindo que somente os campos permitidos sejam atualizados.
    const updatedUser = { ...user, ...userToUpdate };
    return await this.userRepository.save(updatedUser);
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async getUserInfo(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
}
