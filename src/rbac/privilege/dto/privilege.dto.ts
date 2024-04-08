// export class CreatePrivilegeDto {}
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {IsNotEmpty,IsString, IsUUID} from "class-validator"

export class PrivilegeDto {
  @Expose()
  @IsUUID()
  privilegeId: string;

  @ApiProperty({
    type: String,
    description: "Privilege title",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  privilegeName: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
