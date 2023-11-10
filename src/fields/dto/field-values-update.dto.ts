import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldValuesUpdateDto {
  //fieldValuesId
  @ApiProperty({
    type: String,
    description: "The fieldValuesId of the field values",
    default: "",
  })
  @Expose()
  fieldValuesId: string;

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
