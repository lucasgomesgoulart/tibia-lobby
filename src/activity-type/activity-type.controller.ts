import { Controller, Get } from "@nestjs/common";
import { ActivityTypeService } from "./activity-type.service";

@Controller('activeType')
export class ActivityTypeController {
    constructor(private readonly activityTypeService: ActivityTypeService) {}

    @Get()
    async getAllActivityTypes() {
        const types = await this.activityTypeService.findAll();
        return types.map(t => ({ id: t.id, name: t.name }));
    }
}
