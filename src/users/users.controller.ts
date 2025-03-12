import { Body, Controller, Get, Post, Put, Param, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserDto) {
    const newUser = await this.usersService.createUser(user);
    return { message: 'Usuário criado com sucesso', data: newUser };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    const userToUpdate = await this.usersService.updateUser(id, user);
    return { message: 'Usuário atualizado com sucesso', data: userToUpdate };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getUserInfo(@Req() req) {
    const userId = req.userId;
    const user = await this.usersService.getUserInfo(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return {
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
      address_2: user.address_2,
    };
  }
}
