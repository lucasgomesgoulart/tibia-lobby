import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from '../db/entities/characters.entity';
import { User } from '../db/entities/user.entity';
import { CharacterService } from './characters.service';
import { CharacterController } from './characters.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Character, User])], 
    controllers: [CharacterController], 
    providers: [CharacterService], 
    exports: [CharacterService], 
})
export class CharactersModule {}
