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
  tenantId: string;
  @Expose()
  fieldId: string;
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;

  //assetId
  @ApiProperty({
    type: String,
    description: "The assetId of the fields",
    default: "",
  })
  @Expose()
  assetId: string;

  //context
  @ApiProperty({
    type: String,
    description: "The context of the fields",
    default: "",
  })
  @Expose()
  context: string;

  //contextId
  @ApiProperty({
    type: String,
    description: "The contextId of the fields",
    default: "",
  })
  @Expose()
  contextId: string;

  //contexType
  @ApiProperty({
    type: String,
    description: "The contexType of the fields",
    default: "",
  })
  @Expose()
  contexType: string;

  //render
  @ApiProperty({
    type: Object,
    description: "The form render json of the fields",
  })
  @Expose()
  render: any;

  //groupId
  @ApiProperty({
    type: String,
    description: "The groupId of the fields",
    default: "",
  })
  @Expose()
  groupId: string;

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

  //defaultValue
  @ApiProperty({
    type: String,
    description: "The defaultValue of the fields",
    default: "",
  })
  @Expose()
  defaultValue: string;

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
  required: Boolean;

  //ordering
  @ApiProperty({
    type: Number,
    description: "The ordering of the fields",
    default: 0,
  })
  @Expose()
  ordering: Number;

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

  //onlyUseInSubform
  @ApiProperty({
    type: Boolean,
    description: "The onlyUseInSubform of the fields",
    default: true,
  })
  @Expose()
  onlyUseInSubform: Boolean;

  //createdBy
  @ApiProperty({
    type: String,
    description: "The createdBy of the fields",
    default: "",
  })
  @Expose()
  createdBy: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The updatedBy of the fields",
    default: "",
  })
  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
