import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthRbacService } from "./authRbac.service";
import { ApiBasicAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";

@ApiTags("AuthRbac")
@Controller("auth/rbac")
export class AuthRbacController {
  constructor(private authService: AuthRbacService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/token")
  @ApiBasicAuth("access-token")
  @UseGuards(JwtAuthGuard)
  signInRbac(@Req() req) {
    // console.log(req.user, "user");
    return this.authService.signInRbac(req.user.userId);
  }
}
