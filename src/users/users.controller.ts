import { Body, Controller, Get, Post, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './user.dto';

@Controller('users')
export class UsersController {
    constructor(private UsersService: UsersService) {}

    @Post()
    async create(@Body() user: UserDto) {
        try {
            const newUser = await this.UsersService.createUser(user);
            return { message: "Usuário criado com sucesso", data: newUser };
        } catch (err) {
            throw new HttpException(
                { message: err.message || "Erro ao criar usuário" },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
