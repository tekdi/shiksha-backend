import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";

export class FieldValuesSearchDto {
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

  constructor(partial: Partial<FieldValuesSearchDto>) {
    Object.assign(this, partial);
  }
}
export class FieldOptionsDto {
  @ApiPropertyOptional({
    type: String,
    description: "Field Name",
  })
  @Expose()
  @IsNotEmpty()
  fieldName: string;

  @ApiPropertyOptional({
    type: String,
    description: "Associated To",
  })
  @Expose()
  associatedTo: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}