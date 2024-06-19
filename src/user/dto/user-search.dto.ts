import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsObject,
  IsOptional,
  IsArray,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { User } from "../entities/user-entity";

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
    description: "Role",
  })
  role: string;

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
  userIDs?: string[];

  @ApiProperty({
    type: [String],
    description: "Parent Id",
    default: [],
  })
  @Expose()
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  cohortIDs?: string[];
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
    description: "Page",
  })
  @Expose()
  @IsOptional()
  page: number;

  @ApiProperty({
    type: setFilters,
    description: "Filters",
  })
  @Expose()
  @IsOptional()
  @IsObject()
  filters: setFilters;

  @ApiProperty({
    type: excludeFields,
    description: "Filters",
  })
  @Expose()
  @IsOptional()
  @IsObject()
  exclude: excludeFields;

  constructor(partial: Partial<UserSearchDto>) {
    Object.assign(this, partial);
  }
}

