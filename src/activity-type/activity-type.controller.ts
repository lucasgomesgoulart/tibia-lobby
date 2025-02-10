import { Controller, Get, UseGuards } from "@nestjs/common";
import { ActivityTypeService } from "./activity-type.service";
import { AuthGuard } from "src/auth/auth.guard";

@UseGuards(AuthGuard)
@Controller('activeType')
export class ActivityTypeController {
    constructor(private readonly activityTypeService: ActivityTypeService) {}

    @Get()
    async getAllActivityTypes() {
        const types = await this.activityTypeService.findAll();
        return types.map(type => type.name); 
    }
}
