import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ModuleTrackingDto } from "src/module/moduleTracking.dto";

export class ALTModuleTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: ModuleTrackingDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: ModuleTrackingDto;

  constructor(partial: Partial<ALTModuleTrackingSearch>) {
    Object.assign(this, partial);
  }
}
