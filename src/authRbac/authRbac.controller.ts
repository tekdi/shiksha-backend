import {
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthRbacService } from "./authRbac.service";
import { ApiBasicAuth, ApiHeader, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";

@ApiTags("AuthRbac")
@Controller("auth/rbac")
export class AuthRbacController {
  constructor(private authService: AuthRbacService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/token")
  @ApiHeader({
    name: "tenantid",
  })
  @ApiBasicAuth("access-token")
  @UseGuards(JwtAuthGuard)
  signInRbac(@Req() req) {
    const tenantId = req.headers["tenantid"];
    return this.authService.signInRbac(req.user.username, tenantId);
  }
}
