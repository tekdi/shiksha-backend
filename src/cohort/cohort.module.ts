import { Module } from "@nestjs/common";
import { CohortController } from "./cohort.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortAdapter } from "./cohortadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { CohortService } from "./cohort.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cohort } from "./entities/cohort.entity";
import { FieldsService } from "../fields/fields.service";
import { Fields } from "../fields/entities/fields.entity";
import { FieldValues } from "../fields/entities/fields-values.entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { PostgresCohortService } from "src/adapters/postgres/cohort-adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cohort, FieldValues, Fields, CohortMembers]),
    HttpModule,
    HasuraModule,
    PostgresModule
  ],
  controllers: [CohortController],
  providers: [CohortAdapter, CohortService, FieldsService,PostgresCohortService],
})
export class CohortModule {}
