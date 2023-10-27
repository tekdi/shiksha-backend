import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { CohortMembersController } from "./cohortMembers.controller";
import { CohortMembersService } from "src/adapters/hasura/cohortMembers.adapter";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CohortMembersController],
  providers: [CohortMembersService],
})
export class CohortMembersModule {}
