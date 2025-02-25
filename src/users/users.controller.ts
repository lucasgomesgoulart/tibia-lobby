import { Body, Controller, Get, Post, HttpException, HttpStatus, Req, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './user.dto';

@Controller('users')
export class UsersController {
    constructor(private UsersService: UsersService) { }

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

    @Put(":id")
    async updateUser(@Param('id') id: string, @Body() user: Partial<UserDto>) {
        try {
            const userToUpdate = await this.UsersService.updateUser(id, user)
            return { message: "Usuário atualizado com sucesso", data: userToUpdate }
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao atualizar usuário" },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get("me")
    async getInfo(@Req() req) {
        try {
            const userId = req.userId
            const user = await this.UsersService.getUserInfo(userId);
            if (!user) {
                throw new HttpException(
                    { message: "Usuário não encontrado" },
                    HttpStatus.NOT_FOUND
                );
            }

            return {
                message: "Informações do usuário",
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    country: user.country,
                    state: user.state,
                    city: user.city,
                    zip_code: user.zip_code,
                    address: user.address,
                    address_2: user.address_2
                }
            }
        } catch (error) {
            throw new HttpException(
                { message: error.message || "Erro ao buscar informações do usuário" },
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }
}
