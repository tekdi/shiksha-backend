import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

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

  constructor(partial: AuthDto) {
    Object.assign(this, partial);
  }
}

export class RefreshTokenRequestBody {
  @ApiProperty({
    type: String,
    description: "token",
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  constructor(partial: RefreshTokenRequestBody) {
    Object.assign(this, partial);
  }
}

export class LogoutRequestBody {
  @ApiProperty({
    type: String,
    description: "token",
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;

  constructor(partial: LogoutRequestBody) {
    Object.assign(this, partial);
  }
}
