import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RbacJwtStrategy extends PassportStrategy(Strategy, "jwt-rbac") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader("rbac_token"),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("RBAC_JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    if (
      !(
        payload.iss === this.configService.get<string>("ISSUER") &&
        payload.aud === this.configService.get<string>("AUDIENCE")
      )
    ) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
