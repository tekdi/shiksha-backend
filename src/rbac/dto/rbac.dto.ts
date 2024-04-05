import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class RoleDto {
  @Expose()
  roleId: string;

  @ApiProperty({
    type: String,
    description: "The name of the role",
    default: "",
  })
  @Expose()
  roleName: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
