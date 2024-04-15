import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty,IsString, IsUUID, Matches} from "class-validator"

export class PrivilegeDto {
  @Expose()
  privilegeId: string;

  @ApiProperty({
    type: String,
    description: "Privilege title",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  privilegeName: string;

  @ApiProperty({
    type: String,
    description: "label",
    default: "",
  })
  @Expose()
  label: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
