import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ALTLessonTrackingDto } from "./altLessonTracking.dto";

export class ALTLessonTrackingSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: ALTLessonTrackingDto,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: ALTLessonTrackingDto;

  constructor(partial: Partial<ALTLessonTrackingSearch>) {
    Object.assign(this, partial);
  }
}
