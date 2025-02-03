import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from '../db/entities/characters.entity';
import { User } from '../db/entities/user.entity';
import { CharacterService } from './characters.service';
import { CharacterController } from './characters.controller';
import { World } from 'src/db/entities/World.entity';
import { OtServer } from 'src/db/entities/otserver.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Character, User, World, OtServer])], 
    controllers: [CharacterController], 
    providers: [CharacterService], 
    exports: [CharacterService], 
})
export class CharactersModule {}
