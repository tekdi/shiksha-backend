import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsObject,
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
export class UserSearchDto {
  @ApiProperty({
    type: Number,
    description: "Limit",
  })
  limit: number;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  page: number;

  @ApiProperty({
    type: setFilters,
    description: "Filters",
  })
  @IsObject()
  filters: setFilters;



  constructor(partial: Partial<UserSearchDto>) {
    Object.assign(this, partial);
  }
}

