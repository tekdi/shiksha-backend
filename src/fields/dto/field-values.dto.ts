import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldValuesDto {
  //generated fields
  @Expose()
  id: string;

  //field_id
  @ApiProperty({
    type: String,
    description: "The field_id of the field values",
    default: "",
  })
  @Expose()
  field_id: string;

  //value
  @ApiProperty({
    type: String,
    description: "The value of the field values",
    default: "",
  })
  @Expose()
  value: string;

  //item_id
  @ApiProperty({
    type: String,
    description: "The item_id of the field values",
    default: "",
  })
  @Expose()
  item_id: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
