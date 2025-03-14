import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/db/entities/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lobby } from 'src/db/entities/lobby.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Lobby])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
