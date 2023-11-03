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
  //generated fields
  @Expose()
  TenantId: string;
  @Expose()
  cohortId: string;
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;

  //ProgramId
  @ApiPropertyOptional({
    type: String,
    description: "The ProgramId of the cohort",
    default: "",
  })
  @Expose()
  ProgramId: string;

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

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
