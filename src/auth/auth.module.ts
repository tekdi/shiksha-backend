import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "src/common/guards/keycloak.strategy";
import { RbacJwtStrategy } from "src/common/guards/rbac.strategy";
import { UserAdapter } from "../user/useradapter";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user-entity";
import { FieldValues } from "../user/entities/field-value-entities";
import { Field } from "src/user/entities/field-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { KeycloakService } from "src/common/utils/keycloak.service";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";
import { PostgresUserService } from "src/adapters/postgres/user-adapter";
import { FieldsService } from "src/adapters/hasura/services/fields.service";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { PostgresModule } from "src/adapters/postgres/potsgres-module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FieldValues, Field, CohortMembers]),
    HttpModule,
    HasuraModule,
    PostgresModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RbacJwtStrategy,
    KeycloakService,
    UserAdapter,
  ],
})
export class AuthModule {}
