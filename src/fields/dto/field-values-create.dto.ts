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
  @ApiProperty({
    type: String,
    description: "The fieldId of the field values",
    default: "",
  })
  @Expose()
  fieldId: string;

  //value
  @ApiProperty({
    type: String,
    description: "The value of the field values",
    default: "",
  })
  @Expose()
  value: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
