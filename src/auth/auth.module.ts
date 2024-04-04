import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "src/common/guards/keycloak.strategy";
import { UserService } from "src/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user-entity";
import { FieldValues } from "../user/entities/field-value-entities";
import { Field } from "src/user/entities/field-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { KeycloakService } from "src/common/utils/keycloak.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FieldValues, Field, CohortMembers]),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KeycloakService, UserService],
})
export class AuthModule {}
