import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CohortSearchFieldsDto {
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
    description: "Filters on values",
  })
  @ApiPropertyOptional()
  filters: object;

  constructor(partial: Partial<CohortSearchFieldsDto>) {
    Object.assign(this, partial);
  }
}
