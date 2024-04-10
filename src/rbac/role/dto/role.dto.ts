import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty,IsString, IsUUID} from "class-validator"

export class RoleDto {
  
  @Expose()
  roleId: string;

  @ApiProperty({
    type: String,
    description: "The name of the role",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  roleName: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
