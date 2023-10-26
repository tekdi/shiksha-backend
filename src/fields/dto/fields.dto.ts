import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldsDto {
  @Expose()
  id: string;

  @Expose()
  fieldsId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The schoolId of the fields",
  })
  @Expose()
  schoolId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The name of the fields",
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: "The type of the fields",
  })
  @Expose()
  type: string;

  @ApiPropertyOptional({
    type: String,
    description: "The section of the fields",
  })
  @Expose()
  section: string;

  @ApiPropertyOptional({
    type: String,
    description: "The status of the fields",
  })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    type: String,
    description: "Teacher Id of Fields",
  })
  @Expose()
  teacherId: string;

  @ApiPropertyOptional({
    type: String,
    description: "Parent Id of Fields",
  })
  @Expose()
  parentId: string;

  @ApiPropertyOptional()
  @Expose()
  deactivationReason: string;

  @ApiPropertyOptional({
    type: String,
    description: "The mediumOfInstruction of the fields",
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
    description: "Grade against fields",
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
