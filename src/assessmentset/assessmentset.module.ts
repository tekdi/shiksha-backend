import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ScheduleModule } from "@nestjs/schedule";
import { AssessmentsetController } from "./assessmentset.controller";
import { AssessmentsetService } from "src/adapters/hasura/assessmentset.adapter";

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()],
  controllers: [AssessmentsetController],
  providers: [AssessmentsetService],
})
export class AssessmentSetModule {}
