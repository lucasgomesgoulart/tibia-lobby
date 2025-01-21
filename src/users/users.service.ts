import {hashSync as bcryptHashSync} from 'bcrypt'
import {v4 as uuid} from 'uuid'
import { Injectable } from '@nestjs/common';
import { UserDto } from './user.dto';

@Injectable()
export class UsersService {
    private users: UserDto[] = [];

    createUser(newUser: UserDto){
        newUser.id = uuid()
        newUser.password = bcryptHashSync(newUser.password, 10)
        this.users.push(newUser)
    }

    findUserByUsername(username: string): UserDto | null{
        return this.users.find(u=> u.username === username)
    }
}

