import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AttendanceDateDto {
  @ApiProperty({
    type: Date,
    description: "From Date",
  })
  fromDate: string;

  @ApiProperty({
    type: Date,
    description: "To Date",
  })
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
