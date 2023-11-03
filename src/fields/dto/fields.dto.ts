import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FieldsDto {
  //generated fields
  @Expose()
  TenantId: string;
  @Expose()
  field_id: string;

  //asset_id
  @ApiProperty({
    type: String,
    description: "The asset_id of the fields",
    default: "",
  })
  @Expose()
  asset_id: string;

  //context
  @ApiProperty({
    type: String,
    description: "The context of the fields",
    default: "",
  })
  @Expose()
  context: string;

  //context_id
  @ApiProperty({
    type: String,
    description: "The context_id of the fields",
    default: "",
  })
  @Expose()
  context_id: string;

  //group_id
  @ApiProperty({
    type: String,
    description: "The group_id of the fields",
    default: "",
  })
  @Expose()
  group_id: string;

  //name
  @ApiProperty({
    type: String,
    description: "The name of the fields",
    default: "",
  })
  @Expose()
  name: string;

  //label
  @ApiProperty({
    type: String,
    description: "The label of the fields",
    default: "",
  })
  @Expose()
  label: string;

  //default_value
  @ApiProperty({
    type: String,
    description: "The default_value of the fields",
    default: "",
  })
  @Expose()
  default_value: string;

  //type
  @ApiProperty({
    type: String,
    description: "The type of the fields",
    default: "",
  })
  @Expose()
  type: string;

  //note
  @ApiProperty({
    type: String,
    description: "The note of the fields",
    default: "",
  })
  @Expose()
  note: string;

  //description
  @ApiProperty({
    type: String,
    description: "The description of the fields",
    default: "",
  })
  @Expose()
  description: string;

  //state
  @ApiProperty({
    type: String,
    description: "The state of the fields",
    default: "",
  })
  @Expose()
  state: string;

  //required
  @ApiProperty({
    type: Boolean,
    description: "The required of the fields",
    default: true,
  })
  @Expose()
  required: string;

  //ordering
  @ApiProperty({
    type: Number,
    description: "The ordering of the fields",
    default: 0,
  })
  @Expose()
  ordering: string;

  //metadata
  @ApiProperty({
    type: String,
    description: "The metadata of the fields",
    default: "",
  })
  @Expose()
  metadata: string;

  //access
  @ApiProperty({
    type: String,
    description: "The access of the fields",
    default: "",
  })
  @Expose()
  access: string;

  //only_use_in_subform
  @ApiProperty({
    type: Boolean,
    description: "The only_use_in_subform of the fields",
    default: true,
  })
  @Expose()
  only_use_in_subform: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
