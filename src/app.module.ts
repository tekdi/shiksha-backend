import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { SchoolModule } from "./school/school.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { HolidayModule } from "./holiday/holiday.module";
import { ConfigurationModule } from "./configs/configuration.module";
import { ConfigModule } from "@nestjs/config";
import { WorksheetModule } from "./worksheet/worksheet.module";
import { MulterModule } from "@nestjs/platform-express/multer";
import { QuestionModule } from "./Question/question.module";
import { LikeModule } from "./like/like.module";
import { CommentModule } from "./comment/comment.module";
import { TrackAssessmentModule } from "./trackAssessment/trackassessment.module";
import { AssessmentSetModule } from "./assessmentset/assessmentset.module";
import { MentorTrackingModule } from "./mentorTracking/mentorTracking.module";
import { MonitorTrackingModule } from "./monitorTracking/monitorTracking.module";
import { CourseModule } from "./course/course.module";
import { CourseTrackingModule } from "./courseTracking/courseTracking.module";
import { AnnouncementsModule } from "./announcements/announcements.module";
import { RoleModule } from "./role/role.module";
import { WorkHistoryModule } from "./workHistory/workHistory.module";
import { CohortModule } from "./cohort/cohort.module";
import { CohortMembersModule } from "./cohortMembers/cohortMembers.module";
import { FieldsModule } from "./fields/fields.module";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./common/database.module";
import { SwaggerModule } from "@nestjs/swagger";
// Below modules no longer required in Shiksha 2.0
// import { StudentModule } from "./student/student.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MulterModule.register({
      dest: "./uploads",
    }),
    SchoolModule,
    UserModule,
    RoleModule,
    AttendanceModule,
    HolidayModule,
    ConfigurationModule,
    WorksheetModule,
    QuestionModule,
    LikeModule,
    CommentModule,
    TrackAssessmentModule,
    AssessmentSetModule,
    MentorTrackingModule,
    MonitorTrackingModule,
    CourseModule,
    CourseTrackingModule,
    AnnouncementsModule,
    WorkHistoryModule,
    CohortModule,
    CohortMembersModule,
    FieldsModule,
    AuthModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
