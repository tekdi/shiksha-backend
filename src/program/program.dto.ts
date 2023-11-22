import { Exclude, Expose } from "class-transformer";
import { IsUUID, IsString, IsNotEmpty, IsDate } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProgramDto {
  @Expose()
  @IsUUID()
  programId: string; // AUTO GENERATED

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Name of the Program",
  })
  programName: string;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    type: Date,
    description: "Start Date in format YYYY-MM-DD without timestamp",
  })
  startDate: Date;

  @Expose()
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    type: Date,
    description: "End Date in format YYYY-MM-DD without timestamp",
  })
  endDate: Date;

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

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
