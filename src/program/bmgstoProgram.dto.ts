import { Exclude, Expose } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BMGStoProgramDto {
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
  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    type: Date,
    description: "Current Date in format YYYY-MM-DD without timestamp",
  })
  currentDate: Date;
}
