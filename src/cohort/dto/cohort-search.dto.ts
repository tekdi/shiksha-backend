import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsNumberString, IsObject, IsOptional, IsString } from "class-validator";
import { CohortDto } from "./cohort.dto";
import { Expose } from "class-transformer";

export class setFilters {
  //userIdBy
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  userId?: string;

  //userIdBy
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  cohortId?: string;

  //programId
  @ApiPropertyOptional({
    type: String,
    description: "The programId of the cohort",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  programId?: string;

  //parentId
  @ApiPropertyOptional({
    type: String,
    description: "The parentId of the cohort",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  parentId?: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the cohort",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  //type
  @ApiProperty({
    type: String,
    description: "The type of the cohort",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  type?: string;

  //status
  @ApiPropertyOptional({
    type: Boolean,
    description: "The status of the cohort",
    default: true,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  //createdBy
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  createdBy?: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The cohort is updatedBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class CohortSearchDto {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    type: setFilters,
    description: "Filters",
  })
  @IsObject()
  filters: setFilters;

  constructor(partial: Partial<CohortSearchDto>) {
    Object.assign(this, partial);
  }
}
