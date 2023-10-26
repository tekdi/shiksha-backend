import { CacheModule, Module } from "@nestjs/common";
import { CohortController } from "./cohort.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortAdapter } from "./cohortadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { EsmwadModule } from "src/adapters/esamwad/esamwad.module";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    SunbirdModule,
    HasuraModule,
    EsmwadModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CohortController],
  providers: [CohortAdapter],
})
export class CohortModule {}
