import { Body, Controller, Get, Post, HttpException, HttpStatus, Req, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')

export class UsersController {
    constructor(private UsersService: UsersService) { }

    @Post()
    async create(@Body() user: UserDto) {
        const newUser = await this.UsersService.createUser(user);
        return plainToClass(UserResponseDto, newUser, { excludeExtraneousValues: true });
    }

    @Put(":id")
    async updateUser(@Param('id') id: string, @Body() user: Partial<UserDto>) {
        const userToUpdate = await this.UsersService.updateUser(id, user);
        return plainToClass(UserResponseDto, userToUpdate, { excludeExtraneousValues: true });
    }

    @Get("me")
    @UseGuards(AuthGuard)
    async getUserInfo(@Req() req) {
        const userId = req.userId;
        const user = await this.UsersService.getUserInfo(userId);
        
        if (!user) {
            throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
        }
        
        return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
    }
}
