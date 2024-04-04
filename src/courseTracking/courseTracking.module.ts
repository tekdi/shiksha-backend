import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";
import { CourseTrackingController } from "./courseTracking.controller";

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [CourseTrackingController],
  providers: [CourseTrackingService],
})
export class CourseTrackingModule {}
