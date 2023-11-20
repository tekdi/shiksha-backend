import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ALTSubjectListDto {
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "ProgramId is UUID",
  })
  programId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Board",
  })
  board: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Medium",
  })
  medium: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Grade",
  })
  grade: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
