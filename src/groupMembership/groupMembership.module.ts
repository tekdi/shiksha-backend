import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { GroupMembershipController } from "./groupMembership.controller";
import { GroupMembershipService } from "src/adapters/hasura/groupMembership.adapter";

@Module({
  imports: [HttpModule],
  controllers: [GroupMembershipController],
  providers: [GroupMembershipService],
})
export class GroupMembershipModule {}
