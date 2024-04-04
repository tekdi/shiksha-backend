import { CacheModule, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { HttpModule } from "@nestjs/axios";
import { UserAdapter } from "./useradapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user-entity";
import { FieldValues } from "./entities/field-value-entities";
import { Field } from "./entities/field-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FieldValues, Field, CohortMembers]),
    HttpModule,
    HasuraModule,
    PostgresModule,
  ],
  controllers: [UserController],
  providers: [UserAdapter],
})
export class UserModule {}
