import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WorkHistoryService } from "../adapters/hasura/workhistory.adapter";
import { WorkHistoryController } from "./workHistory.controller";

@Module({
  imports: [HttpModule],
  controllers: [WorkHistoryController],
  providers: [WorkHistoryService],
})
export class WorkHistoryModule {}
