import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {IsString,IsNotEmpty} from 'class-validator'

export class AuthDto {
  @ApiProperty({
    type: String,
    description: "username",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: "password",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}
