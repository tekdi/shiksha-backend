import { Exclude, Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateALTCourseTrackingDto {
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "ID of the respective enrolled course",
  })
  courseId: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Total number of Modules completed",
  })
  totalNumberOfModulesCompleted: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Total number of Modules",
  })
  totalNumberOfModules: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Score of the course",
  })
  calculatedScore: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Status of course",
  })
  status: string;

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

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
