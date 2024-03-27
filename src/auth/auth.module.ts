import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth-service";
import { KeycloakStrategy } from "src/common/guards/keycloak.strategy"; 

const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, KeycloakStrategy],
})
export class AuthModule {}
