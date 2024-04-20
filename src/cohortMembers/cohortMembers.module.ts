import { Module } from "@nestjs/common";
import { CohortMembersController } from "./cohortMembers.controller";
import { HttpModule } from "@nestjs/axios";
import { CohortMembersAdapter } from "./cohortMembersadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CohortMembers } from "./entities/cohort-member.entity";
import { CohortMembersService } from "./cohortMember.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([CohortMembers]),
    HttpModule,
    HasuraModule,
  ],
  controllers: [CohortMembersController],
  providers: [CohortMembersAdapter, CohortMembersService],
})
export class CohortMembersModule {}