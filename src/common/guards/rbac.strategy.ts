import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RbacJwtStrategy extends PassportStrategy(Strategy, "jwt-rbac") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader("rbac_token"),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("RBAC_JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    /**
     * This can be obtained via req.user in the Controllers
     * This is where we validate that the user is valid and delimit the payload returned to req.user
     */

    // console.log(payload, "payload -rbac");
    return payload;
  }
}
