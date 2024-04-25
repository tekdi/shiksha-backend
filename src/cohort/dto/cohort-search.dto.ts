import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsNumberString, IsObject } from "class-validator";
import { CohortDto } from "./cohort.dto";


export class CohortSearchDto {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    type: CohortDto,
    description: "Filters",
  })
  @IsObject()
  filters: object;

  constructor(partial: Partial<CohortSearchDto>) {
    Object.assign(this, partial);
  }
}
