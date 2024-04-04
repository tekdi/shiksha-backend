import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { TrackAssessmentService } from "src/adapters/hasura/trackassessment.adapter";
import { AssessmentController } from "./trackassessment.controller";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [AssessmentController],
  providers: [TrackAssessmentService],
})
export class TrackAssessmentModule {}
