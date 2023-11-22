import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProgramDto } from "./program.dto";

export class ALTProgramSearch {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  page: number;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: Object;

  // @ApiProperty({
  //   type: Object,
  //   description: "Filters",
  // })
  // @ApiPropertyOptional()
  // filters: object;

  constructor(partial: Partial<ALTProgramSearch>) {
    Object.assign(this, partial);
  }
}
