import { CacheModule, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { HttpModule } from "@nestjs/axios";
import { UserAdapter } from "./useradapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user-entity";
import { UserService } from "./user.service";
import { FieldValues } from "./entities/field-value-entities";
import { Field } from "./entities/field-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FieldValues, Field, CohortMembers]),
    HttpModule,
    HasuraModule,
  ],
  controllers: [UserController],
  providers: [UserAdapter, UserService],
})
export class UserModule {}
