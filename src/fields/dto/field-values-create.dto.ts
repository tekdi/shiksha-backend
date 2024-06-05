import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldValuesCreateDto {
  //fieldId
  @Expose()
  fieldId: string;

  //value
  @Expose()
  value: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}

export class FieldOptionsDto {
  @ApiPropertyOptional({
    type: String,
    description: "Field Name",
  })
  @Expose()
  @IsNotEmpty()
  fieldName: string;

  @ApiPropertyOptional({
    type: String,
    description: "Associated To",
  })
  @Expose()
  associatedTo: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
