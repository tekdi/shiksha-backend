import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsNumberString, IsObject, IsOptional, IsString, IsUUID, ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import { CohortDto } from "./cohort.dto";
import { Expose } from "class-transformer";

// Custom decorator to check if the object is not empty
function IsNotEmptyObject(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyObject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value && Object.keys(value).length > 0;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} should not be an empty object`;
        },
      },
    });
  };
}

export class setFilters {
  //userIdBy
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  userId?: string;

  //cohortIdBy
  @ApiProperty({
    type: String,
    description: "The cohort is createdBy",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  cohortId?: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the cohort",
    default: "",
  })
  @Expose()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
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
  @IsNotEmptyObject({ message: 'Filters should not be an empty object' })
  filters: setFilters;

  constructor(partial: Partial<CohortSearchDto>) {
    Object.assign(this, partial);
  }
}
