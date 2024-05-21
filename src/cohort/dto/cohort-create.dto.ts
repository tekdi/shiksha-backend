import { Exclude, Expose, Type } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FieldValuesCreateDto } from "src/fields/dto/field-values-create.dto";

class ParamsDto {
  @ApiProperty({ type: String, description: "Self attendance start time", example: "12:10" })
  @IsString()
  @IsNotEmpty()
  self_attendance_start: string;

  @ApiProperty({ type: String, description: "Self attendance end time", example: "12:20" })
  @IsString()
  @IsNotEmpty()
  self_attendance_end: string;

  @ApiProperty({ type: Number, description: "Allow late marking", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  allow_late_marking: number;
}

export class CohortCreateDto {
  //generated fields
  @Expose()
  tenantId: string;
  @Expose()
  cohortId: string;
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;

  //programId
  @ApiPropertyOptional({
    type: String,
    description: "The programId of the cohort",
    default: "",
  })
  @Expose()
  programId: string;

  //parentId
  @ApiPropertyOptional({
    type: String,
    description: "The parentId of the cohort",
    default: "",
  })
  @Expose()
  parentId: string;

  //referenceId
  @ApiPropertyOptional({
    type: String,
    description: "The referenceId of the cohort",
    default: "",
  })
  @Expose()
  referenceId: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the cohort",
    default: "",
  })
  @Expose()
  name: string;

  //type
  @ApiProperty({
    type: String,
    description: "The type of the cohort",
    default: "",
  })
  @Expose()
  type: string;

  //status
  @ApiPropertyOptional({
    type: String,
    description: "The status of the cohort",
    default: "publish",
  })
  @Expose()
  status: string;

  //attendanceCaptureImage
  @ApiProperty({
    type: Boolean,
    description: "Capture image while marking the attendance",
    default: false,
  })
  @Expose()
  attendanceCaptureImage: Boolean;

  //image
  @Expose()
  @ApiPropertyOptional({ type: "string", format: "binary" })
  image: string;

  //metadata
  @ApiPropertyOptional({
    type: String,
    description: "The metadata of cohort",
    default: "",
  })
  @Expose()
  metadata: string;

  //createdBy
  @Expose()
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  createdBy: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The cohort is updatedBy",
    default: "",
  })
  @Expose()
  updatedBy: string;

  //fieldValues
  @ApiProperty({
    type: String,
    description: "The fieldValues Object",
  })
  @Expose()
  fieldValues: string;


  @ApiPropertyOptional({
    type: ParamsDto,
    description: "The params object containing additional settings",
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParamsDto)
  @IsObject()
  @Expose()
  params: ParamsDto;

  constructor(partial: Partial<CohortCreateDto>) {
    Object.assign(this, partial);
  }
}
