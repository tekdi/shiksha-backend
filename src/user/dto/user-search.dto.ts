import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateIf,
  ArrayMinSize,
  ArrayMaxSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class setFilters {
  @ApiPropertyOptional({
    type: String,
    description: "State",
  })
  state: string;

  @ApiPropertyOptional({
    type: String,
    description: "District",
  })
  district: string;

  @ApiPropertyOptional({
    type: String,
    description: "Block",
  })
  block: string;

  @ApiPropertyOptional({
    type: String,
    description: "Role",
  })
  role: string;

  @ApiPropertyOptional({
    type: String,
    description: "User Name",
  })
  username: string;

  @ApiPropertyOptional({
    type: String,
    description: "User Id",
  })
  userId: string;
}
export class excludeFields {
  @ApiProperty({
    type: [String],
    description: "Exclude User IDs",
    default: [],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  userIds?: string[];

  @ApiProperty({
    type: [String],
    description: "Exclude Cohort IDs",
    default: [],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  cohortIds?: string[];
}

export class customFieldsFilters {
  @ApiProperty({
    type: Boolean,
    description: 'getCustomFields',
    default: false,
  })
  @Expose()
  @IsOptional()
  getCustomFields: boolean = false;

  @ApiProperty({
    type: Boolean,
    description: 'Is Required Field Options',
    default: false,
  })
  @Expose()
  @IsOptional()
  isRequiredFieldOptions: boolean = false;

  @ApiProperty({
    type: [String],
    description: 'Custom Fields Name',
    default: [],
  })
  @Expose()
  @IsOptional()
  customFieldsName: string[];
}
enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class UserSearchDto {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  @Expose()
  @IsOptional()
  limit: number;

  @ApiProperty({
    type: Number,
    description: "Offset",
  })
  @Expose()
  @IsOptional()
  offset: number;

  @ApiProperty({
    type: setFilters,
    description: "Filters",
  })
  @Expose()
  @IsOptional()
  @IsObject()
  filters: setFilters;

  @ApiProperty({
    type: customFieldsFilters,
    description: "Custom Fields Filters",
  })
  @Expose()
  @IsOptional()
  @IsObject()
  customFieldsFilters: customFieldsFilters

  @ApiPropertyOptional({
    type: excludeFields,
    description: "Filters",
  })
  @Expose()
  @IsOptional()
  @IsObject()
  exclude: excludeFields;

  @ApiPropertyOptional({
    description: "Sort",
    example: ["name", "asc"]
  })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(2, { message: 'Sort array must contain exactly two elements' })
  @ArrayMaxSize(2, { message: 'Sort array must contain exactly two elements' })
  sort: [string, string];

  @ValidateIf((o) => o.sort !== undefined)
  @IsEnum(SortDirection, { each: true, message: 'Sort[1] must be either asc or desc' })
  get sortDirection(): string | undefined {
    return this.sort ? this.sort[1] : undefined;
  }

  constructor(partial: Partial<UserSearchDto>) {
    Object.assign(this, partial);
  }
}

