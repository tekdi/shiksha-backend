import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CohortSearchDto {
  @ApiProperty({
    type: String,
    description: "Limit",
  })
  limit: string;

  @ApiProperty({
    type: Number,
    description: "number",
  })
  page: number;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: object;

  constructor(partial: Partial<CohortSearchDto>) {
    Object.assign(this, partial);
  }
}
