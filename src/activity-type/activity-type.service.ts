import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityType } from "../db/entities/activityType";

@Injectable()
export class ActivityTypeService {
    constructor(
        @InjectRepository(ActivityType)
        private readonly activityTypeRepository: Repository<ActivityType>
    ) {}

    async findAll(): Promise<ActivityType[]> {
        return this.activityTypeRepository.find();
    }
}
