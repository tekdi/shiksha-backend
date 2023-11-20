import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateALTLessonTrackingDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Status of lesson",
  })
  status: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Number of Attempts taken",
  })
  attempts: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Score of the lesson",
  })
  score: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ScoreDetails of the lesson",
  })
  scoreDetails: String;

  @ApiProperty({
    type: String,
    description: "Created by uuid",
  })
  @Expose()
  createdBy: string;

  @ApiProperty({
    type: String,
    description: "Updated by uuid",
  })
  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
