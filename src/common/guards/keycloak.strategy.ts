import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-keycloak-oauth2-oidc";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, "keycloak") {
  constructor(private readonly configService: ConfigService) {
    super({
      host: configService.get("KEYCLOAK"),
      realm: configService.get("KEYCLOAK_REALM"),
      clientID: configService.get("KEYCLOAK_CLIENT_ID"),
      clientSecret: configService.get("KEYCLOAK_HASURA_CLIENT_SECRET"),
      authServerURL: configService.get("KEYCLOAK_AUTH_SERVER"),
      callbackURL: configService.get("KEYCLOAK_AUTH_SERVER"),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    // You can perform additional validation or data manipulation here
    return { accessToken, refreshToken, profile };
  }
}
