import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ProgramDto {
  @ApiProperty({
    type: String,
    description: "The name of the program",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  programName: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
