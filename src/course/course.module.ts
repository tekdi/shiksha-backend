import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { CourseController } from "./course.controller";
import {
  DikshaCourseService,
  DikshaCourseToken,
} from "src/adapters/diksha/dikshaCourse.adapter";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CourseController],
  providers: [{ provide: DikshaCourseToken, useClass: DikshaCourseService }],
})
export class CourseModule {}
