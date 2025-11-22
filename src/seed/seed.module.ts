import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { World } from '../db/entities/world.entity';
import { OtServer } from '../db/entities/otserver.entity';
import { ActivityType } from '../db/entities/activityType';

@Module({
  imports: [TypeOrmModule.forFeature([World, OtServer, ActivityType])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}
