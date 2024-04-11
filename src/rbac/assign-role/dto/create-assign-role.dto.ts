// export class CreatePrivilegeDto {}
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty,IsString, IsUUID} from "class-validator"

export class CreateAssignRoleDto {
    @ApiProperty({
    type: String,
    description: "User Id of User",
    default: "",
  })
  @Expose()
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: String,
    description: "Assigned Role Id",
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
