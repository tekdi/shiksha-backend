import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CohortDto {
  @Expose()
  id: string;

  @Expose()
  cohortId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The schoolId of the cohort",
  })
  @Expose()
  schoolId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The name of the cohort",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: "The type of the cohort",
  })
  @Expose()
  type: string;

  @ApiPropertyOptional({
    type: String,
    description: "The section of the cohort",
  })
  @Expose()
  section: string;

  @ApiPropertyOptional({
    type: String,
    description: "The status of the cohort",
  })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    type: String,
    description: "Teacher Id of Cohort",
  })
  @Expose()
  teacherId: string;

  @ApiPropertyOptional({
    type: String,
    description: "Parent Id of Cohort",
  })
  @Expose()
  parentId: string;

  @ApiPropertyOptional()
  @Expose()
  deactivationReason: string;

  @ApiPropertyOptional({
    type: String,
    description: "The mediumOfInstruction of the cohort",
  })
  @Expose()
  mediumOfInstruction: string;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  @Expose()
  image: string;

  @ApiPropertyOptional()
  @Expose()
  metaData: [string];

  @ApiPropertyOptional()
  @Expose()
  option: [string];

  @ApiPropertyOptional({
    description: "Grade against cohort",
  })
  @Expose()
  gradeLevel: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
