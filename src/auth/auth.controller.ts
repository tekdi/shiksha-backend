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
  Response,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import {
  AuthDto,
  RefreshTokenRequestBody,
  LogoutRequestBody,
} from "./dto/auth-dto";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { RbacAuthGuard } from "src/common/guards/rbac.guard";
import { Permissions } from "src/common/decorators/permission.decorator";

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

  @Get("/user")
  @UseGuards(JwtAuthGuard)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getUserByAuth(@Req() request, @Res() response: Response) {
    console.log(request.user, "user");
    console.log(request.user.userData, "userData");
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
