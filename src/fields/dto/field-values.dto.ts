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
  fieldValuesId: string;
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;

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

  //itemId
  @ApiProperty({
    type: String,
    description: "The itemId of the field values",
    default: "",
  })
  @Expose()
  itemId: string;

  //createdBy
  @ApiProperty({
    type: String,
    description: "The createdBy of the field values",
    default: "",
  })
  @Expose()
  createdBy: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The updatedBy of the field values",
    default: "",
  })
  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
