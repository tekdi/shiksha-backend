import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { User } from "../entities/user-entity";

export class UserSearchDto {
  @ApiProperty({ type: () => User })
  limit: string;

  @ApiProperty({
    type: Object,
    description: "Filters",
  })
  @ApiPropertyOptional()
  filters: object;

  @ApiProperty({
    type: Number,
    description: "Page",
  })
  page: number;

  constructor(partial: Partial<UserSearchDto>) {
    Object.assign(this, partial);
  }
}
