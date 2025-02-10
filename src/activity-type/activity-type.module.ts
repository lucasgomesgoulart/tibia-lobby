import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTypeService } from './activity-type.service';
import { ActivityTypeController } from './activity-type.controller';
import { ActivityType } from 'src/db/entities/activityType'

@Module({
  imports: [TypeOrmModule.forFeature([ActivityType])],
  controllers: [ActivityTypeController],
  providers: [ActivityTypeService],
})
export class ActivityTypeModule {}
