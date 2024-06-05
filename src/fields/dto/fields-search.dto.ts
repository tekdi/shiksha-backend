import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class FieldsSearchDto {
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

  constructor(partial: Partial<FieldsSearchDto>) {
    Object.assign(this, partial);
  }
}

