import { Exclude, Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsOptional
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FieldValuesCreateDto } from "src/fields/dto/field-values-create.dto";

export class CohortCreateDto {
  @Expose()
  cohortId: string;

  @Expose()
  tenantId: string;

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
  @Expose()
  referenceId: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the cohort",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  name: string;

  //type
  @ApiProperty({
    type: String,
    description: "The type of the cohort",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  type: string;

  //status
  @Expose()
  status: string;

  //attendanceCaptureImage
  @Expose()
  attendanceCaptureImage: boolean;

  //image need for future
  // @Expose()
  // @ApiPropertyOptional({ type: "string", format: "binary" })
  // image: string;

  //metadata
  @Expose()
  metadata: string;

  //createdBy
  @Expose()
  createdBy: string;

  //updatedBy
  @Expose()
  updatedBy: string;

  //fieldValues
  @ApiPropertyOptional({
    type: String,
    description: "The fieldValues Object",
  })
  @IsString()
  @IsOptional()
  @Expose()
  fieldValues?: string;


  constructor(obj?: Partial<CohortCreateDto>) {
    if (obj) {
      Object.assign(this, obj);
    }
  }
}
