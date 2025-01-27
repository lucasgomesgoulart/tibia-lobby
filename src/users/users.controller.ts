import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './user.dto';

@Controller('users')
export class UsersController {
    constructor(private UsersService: UsersService) {}

    @Post()
    async create(@Body() user: UserDto){
        try{
            const newUser = this.UsersService.createUser(user) 
            console.log(newUser)
            return {message: "Usuario criado com sucesso"}            
        }catch(err){
            return {message: "Ocorreu um erro ao tentar criar o usuario", error: err}
        }
    }

}
