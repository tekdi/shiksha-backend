import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { MentorTrackingService } from "src/adapters/hasura/mentorTracking.adapter";
import { MentorTrackingController } from "./mentorTracking.controller";

@Module({
  imports: [HttpModule],
  controllers: [MentorTrackingController],
  providers: [MentorTrackingService],
})
export class MentorTrackingModule {}
