import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";

export class AttendanceDateDto {
  @ApiProperty({
    type: Date,
    description: "From Date",
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  fromDate: string;

  @ApiProperty({
    type: Date,
    description: "To Date",
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  @IsNotEmpty()
  toDate: string;

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

  constructor(partial: Partial<AttendanceDateDto>) {
    Object.assign(this, partial);
  }
}
