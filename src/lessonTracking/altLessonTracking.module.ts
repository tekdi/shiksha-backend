import { CacheModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { EsmwadModule } from "src/adapters/esamwad/esamwad.module";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
import { ALTLessonTrackingController } from "./altLessonTracking.controller";
import { ALTLessonTrackingService } from "src/lessonTracking/altLessonTracking.adapter";
import { ProgramService } from "src/program/altProgram.adapter";
import { ALTProgramAssociationService } from "src/program/altProgramAssociation.adapter";
import { ALTModuleTrackingService } from "src/module/altModuleTracking.adapter";
import { UserAdapter } from "src/user/useradapter";
import { CourseModule } from "src/course/course.module";
import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";
import { EsamwadUserService } from "src/adapters/esamwad/user.adapter";
import { UserService } from "src/adapters/sunbirdrc/user.adapter";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
   
    CacheModule.register({
      ttl: ttl,
    })
  ],
  controllers: [ALTLessonTrackingController],
  providers: [ALTLessonTrackingService,ProgramService,ALTProgramAssociationService,ALTModuleTrackingService,UserAdapter,CourseTrackingService,EsamwadUserService,UserService],
})
export class altLessonTrackingModule {}
