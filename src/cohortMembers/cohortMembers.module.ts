import { CacheModule, Module } from "@nestjs/common";
import { CohortMembersController } from "./cohortMembers.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortMembersAdapter } from "./cohortMembersadapter";
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
  controllers: [CohortMembersController],
  providers: [CohortMembersAdapter],
})
export class CohortMembersModule {}
