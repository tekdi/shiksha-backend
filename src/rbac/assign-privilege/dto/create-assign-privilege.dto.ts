import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty,IsString, IsUUID} from "class-validator"

export class CreatePrivilegeRoleDto {
    @ApiProperty({
    type: String,
    description: "Privilege Id",
    default: "",
  })
  @Expose()
  @IsUUID()
  privilegeId: string;

  @ApiProperty({
    type: String,
    description: "Role Id",
    default: "",
  })
  @Expose()
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
