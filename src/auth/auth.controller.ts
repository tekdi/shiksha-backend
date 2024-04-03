import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiHeader,
  ApiBasicAuth,
  ApiOkResponse,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  SerializeOptions,
  Req,
  Res,
  Request,
  Response,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  AuthDto,
  RefreshTokenRequestBody,
  LogoutRequestBody,
} from "./dto/auth-dto";
import { AuthService } from "./auth.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/login")
  @ApiBody({ type: AuthDto })
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get("/getUserDetails")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getUserByAuth(
    @Req() request: Request,
    @Res() response: Response
  ) {
    // const tenantId = headers["tenantid"];
    return this.authService.getUserByAuth(request, response);
  }

  @Post("/refresh")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenRequestBody })
  @UsePipes(ValidationPipe)
  refreshToken(@Body() body: RefreshTokenRequestBody) {
    const { refresh_token: refreshToken } = body;

    return this.authService.refreshToken(refreshToken);
  }

  @Post("/logout")
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LogoutRequestBody })
  async logout(@Body() body: LogoutRequestBody) {
    const { refresh_token: refreshToken } = body;

    await this.authService.logout(refreshToken);
  }
}
