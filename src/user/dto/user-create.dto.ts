import {Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
} from "class-validator";
import { User } from "../entities/user-entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserCreateDto {

  @Expose()
  userId: string;

  @ApiProperty({ type: () => User })
  @Expose()
  @IsNotEmpty()
  username: string;

  // @ApiProperty({
  //   type: String,
  //   description: "The name of the user",
  // })
  @ApiProperty({ type: () => String })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: "The role of the user",
  })
  @Expose()
  role: string;

  @ApiPropertyOptional({
    type: String,
    description: "The date of Birth of the user",
  })
  @Expose()
  dob: string;

  @ApiPropertyOptional({
    type: String,
    description: "The contact number of the user",
  })
  @Expose()
  mobile: string;

  @ApiPropertyOptional({
    type: String,
    description: "The email of the user",
  })
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: String,
    description: "The password of the user",
  })
  @IsNotEmpty()
  @Expose()
  password: string;

  @ApiPropertyOptional({
    type: String,
    description: "The district of the user",
  })
  @Expose()
  district: string;

  @ApiPropertyOptional({
    type: String,
    description: "The state of the user",
  })
  @Expose()
  state: string;

  @ApiPropertyOptional({
    type: String,
    description: "The address of the user",
  })
  @Expose()
  address: string;

  @ApiPropertyOptional({
    type: String,
    description: "The pincode of the user",
  })
  @Expose()
  pincode: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  @ApiPropertyOptional({
    type: String,
    description: "The cohort id of the user",
  })
  @Expose()
  @IsNotEmpty()
  cohortId: string;

  //fieldValues
  @ApiProperty({
    type: String,
    description: "The fieldValues Object",
  })
  @Expose()
  fieldValues: string;

  @ApiProperty({
    type: String,
    description: "Tenant Id",
    default: [],
  })
  @Expose()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty({ each: true })
  tenantId: string;

  constructor(partial: Partial<UserCreateDto>) {
    Object.assign(this, partial);
  }
}
