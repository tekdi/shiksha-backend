import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiHeader,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Res,
  Request,
  Response,
  Headers,
} from "@nestjs/common";
import { HasuraAuthService } from "src/adapters/auth/auth.adapter";
import { AuthDto } from "./dto/auth-dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: HasuraAuthService
  ) {}

  @Post("/login")
  @ApiBody({ type: AuthDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async login(
    @Req() request: Request,
    @Res() response: Response,
    @Body() authDto: AuthDto
  ) {
    console.log(request)
    return this.authService.login(request, response, authDto);
  }
}
