import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// import { MulterModule } from "@nestjs/platform-express/multer";
// Below modules not in use for Shiksha 2.0

/*
import { ConfigurationModule } from "./configs/configuration.module";
import { LikeModule } from "./like/like.module";
import { CommentModule } from "./comment/comment.module";
import { TrackAssessmentModule } from "./trackAssessment/trackassessment.module";
import { AssessmentSetModule } from "./assessmentset/assessmentset.module";
import { MentorTrackingModule } from "./mentorTracking/mentorTracking.module";
import { MonitorTrackingModule } from "./monitorTracking/monitorTracking.module";
import { AnnouncementsModule } from "./announcements/announcements.module";
import { WorkHistoryModule } from "./workHistory/workHistory.module";
*/
// In use for Shiksha 2.0
import { DatabaseModule } from "./common/database.module";
import { AuthModule } from "./auth/auth.module";
import { CohortModule } from "./cohort/cohort.module";
import { CohortMembersModule } from "./cohortMembers/cohortMembers.module";
import { FieldsModule } from "./fields/fields.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { UserModule } from "./user/user.module";
import { RbacModule } from "./rbac/rbac.module";

@Module({
  imports: [
    RbacModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // MulterModule.register({
    //   dest: "./uploads",
    // }),
    UserModule,
    AttendanceModule,
    CohortModule,
    CohortMembersModule,
    FieldsModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
