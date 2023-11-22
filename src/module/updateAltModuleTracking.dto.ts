import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateALTModuleTrackingDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Total number of Modules completed",
  })
  totalNumberOfLessonsCompleted: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Score of the Module",
  })
  calculatedScore: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Status of module",
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
  created_at: string;

  @Expose()
  updated_at: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
