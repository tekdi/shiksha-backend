import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AuthDto {
  @ApiProperty({
    type: String,
    description: "username",
  })
  username: string;

  @ApiProperty({
    type: String,
    description: "password",
  })
  password: string;

  constructor(partial: Partial<AuthDto>) {
    Object.assign(this, partial);
  }
}
