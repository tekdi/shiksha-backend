import { CacheModule, Module } from "@nestjs/common";
import { CohortController } from "./cohort.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortAdapter } from "./cohortadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { CohortService } from "./cohort.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cohort } from "./entities/cohort.entity";
// import { FieldsModule } from "../fields/fields.module";
// import { FieldValues } from "../fields/entities/fields-values.entity";
// import { FieldsService } from "../fields/fields.service";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    TypeOrmModule.forFeature([Cohort]),
    HttpModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CohortController],
  providers: [CohortAdapter, CohortService],
})
export class CohortModule {}

