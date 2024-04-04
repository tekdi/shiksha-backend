import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { PostgresUserService } from "./user-adapter";
import { FieldsService } from "src/fields/fields.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user-entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { Field } from "src/user/entities/field-entity";
import { FieldValues } from "src/user/entities/field-value-entities";



@Module({
    imports: [HttpModule,
    TypeOrmModule.forFeature([
    User,
    Field,
    FieldValues,
    CohortMembers
    ])
    ],
    providers: [
        PostgresUserService,
    ],
    exports: [
        PostgresUserService,
    ],
  })
  export class PostgresModule {}
  