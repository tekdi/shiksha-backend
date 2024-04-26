import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthRbacService } from "./authRbac.service";
import { AuthRbacController } from "./authRbac.controller";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("RBAC_JWT_SECRET"),
        signOptions: { expiresIn: configService.get<string>("RBAC_JWT_EXPIRES_IN") },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthRbacService],
  controllers: [AuthRbacController],
})
export class AuthRbacModule {}
