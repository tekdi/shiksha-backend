import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { CourseController } from "./course.controller";
import {
  DikshaCourseService,
  DikshaCourseToken,
} from "src/adapters/diksha/dikshaCourse.adapter";

@Module({
  imports: [HttpModule],
  controllers: [CourseController],
  providers: [{ provide: DikshaCourseToken, useClass: DikshaCourseService }],
})
export class CourseModule {}
