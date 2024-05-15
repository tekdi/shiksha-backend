import {Expose, Type } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
  ValidateNested,
  IsOptional,
} from "class-validator";
import { User } from "../entities/user-entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class tenantRoleMappingDto{
  @ApiProperty({
    type: String,
    description: "Tenant Id",
  })
  @Expose()
  @IsUUID(undefined, { message: 'Tenant Id must be a valid UUID' })
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({
    type: String,
    description: "The cohort id of the user",
  })
  @Expose()
  @IsUUID(undefined, { message: 'Cohort Id must be a valid UUID' })
  @IsNotEmpty()
  cohortId: string;

  @ApiPropertyOptional({
    type: String,
    description: "User Role",
  })
  @IsOptional()
  @Expose()
  @IsUUID(undefined, { message: 'Role Id must be a valid UUID' })
  roleId: string;
}

export class fieldValuesDto{
  @ApiPropertyOptional({
    type: String,
    description: "Field Id",
  })
  @Expose()
  @IsUUID(undefined, { message: 'Field Id must be a valid UUID' })
  fieldId: string;

  // @ApiPropertyOptional({
  //   type: String,
  //   description: "Field type",
  // })
  // @Expose()
  // fieldType: string;

  @ApiPropertyOptional({
    type: String,
    description: "Field values",
  })
  @Expose()
  value: string;
}

export class UserCreateDto {
  @Expose()
  userId: string;

  @ApiProperty({ type: () => User })
  @Expose()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: () => String })
  @Expose()
  name: string;

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

  //fieldValues
  @ApiProperty({
    type: [fieldValuesDto],
    description: "The fieldValues Object",
  })
  @ValidateNested({ each: true })
  @Type(() => fieldValuesDto)
  fieldValues: fieldValuesDto[];

  @ApiProperty({
    type: [tenantRoleMappingDto],
    description: 'List of user attendance details',
  })
  @ValidateNested({ each: true })
  @Type(() => tenantRoleMappingDto)
  tenantCohortRoleMapping: tenantRoleMappingDto[];

  constructor(partial: Partial<UserCreateDto>) {
    Object.assign(this, partial);
  }
}



