import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";

export class ALTCourseTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: CourseTrackingDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: CourseTrackingDto;

  constructor(partial: Partial<ALTCourseTrackingSearch>) {
    Object.assign(this, partial);
  }
}
