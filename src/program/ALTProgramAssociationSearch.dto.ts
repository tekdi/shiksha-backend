import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
// import { ProgramAssociationDto } from "./altProgramAssociation.dto";

export class ALTProgramAssociationSearch {
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

  // @ApiProperty({
  //   type: ProgramAssociationDto,
  //   description: "Filters",
  // })
  // @ApiPropertyOptional()
  // filters: ProgramAssociationDto;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: Object;
  constructor(partial: Partial<ALTProgramAssociationSearch>) {
    Object.assign(this, partial);
  }
}