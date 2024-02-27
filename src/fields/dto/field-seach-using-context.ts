import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldSearchUsingContextDto {
  //context
  @ApiProperty({
    type: String,
    description: "The context values",
    default: "",
  })
  @Expose()
  context: string;

  //contextType
  @ApiProperty({
    type: String,
    description: "The contextType values",
    default: "",
  })
  @Expose()
  contextType: string;

//   contextId
  @ApiProperty({
    type: String,
    description: "The contextId values",
    default: "",
  })
  @Expose()
  contextId: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
