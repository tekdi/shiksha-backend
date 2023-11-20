import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";

export class ALTLessonTrackingDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the respective enrolled course",
  })
  courseId: String;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the module of the lesson",
  })
  moduleId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the respective Lesson",
  })
  lessonId: string;

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
    type: String,
    description: "Type of lesson",
  })
  contentType: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Time spent on lesson",
  })
  duration: string;

  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsNumber()
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
  scoreDetails: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "",
  })
  lessonProgressId: Number;

  @Expose()
  created_at: string;

  @Expose()
  updated_at: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
