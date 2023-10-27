import { CacheModule, Module } from "@nestjs/common";
import { CohortController } from "./cohort.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortAdapter } from "./cohortadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CohortController],
  providers: [CohortAdapter],
})
export class CohortModule {}
