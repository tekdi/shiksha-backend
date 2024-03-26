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
import { AuthDto } from "./dto/auth-dto";
import { AuthService } from "./auth-service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService:AuthService
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
    return this.authService.login(authDto,response);
  }

  @Get('/getUserDetails')
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getUserByAuth(@Req() request: Request,@Res() response:Response){
    // const tenantId = headers["tenantid"];
    return this.authService.getUserByAuth(request,response);
  }

}
