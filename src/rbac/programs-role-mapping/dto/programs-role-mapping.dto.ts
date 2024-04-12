import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsUUID } from "class-validator";

export class ProgramsRoleMappingDto {

    @Expose()
    Id: string;
  
    @ApiProperty({
      type: String,
      description: "Role Id",
      default: "",
    })
    @Expose()
    @IsNotEmpty()
    @IsUUID()
    roleId: string;
  
  
    @ApiProperty({
        type: String,
        description: "Privilege Id",
        default: "",
      })
      @Expose()
      @IsNotEmpty()
      @IsUUID()
      programId: string;
  
    constructor(obj: any) {
      Object.assign(this, obj);
    }
}
