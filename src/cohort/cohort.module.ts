import { Module } from "@nestjs/common";
import { CohortController } from "./cohort.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortAdapter } from "./cohortadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cohort } from "./entities/cohort.entity";
import { FieldsService } from "../fields/fields.service";
import { Fields } from "../fields/entities/fields.entity";
import { FieldValues } from "../fields/entities/fields-values.entity";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { PostgresCohortService } from "src/adapters/postgres/cohort-adapter";
import { UserTenantMapping } from "src/userTenantMapping/entities/user-tenant-mapping.entity";
import { State } from "./entities/state.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Cohort, FieldValues, Fields, CohortMembers, UserTenantMapping,State]),
    HttpModule,
    HasuraModule,
    PostgresModule
  ],
  controllers: [CohortController],
  providers: [CohortAdapter, FieldsService,PostgresCohortService],
})
export class CohortModule {}
