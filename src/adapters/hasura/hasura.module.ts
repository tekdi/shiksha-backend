import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AttendanceHasuraService } from "./attendance.adapter";
import { HasuraCommentService } from "./comment.adapter";
import { HasuraConfigService } from "./config.adapter";
import { HasuraGroupService } from "./group.adapter";
import { HasuraHolidayService } from "./holiday.adapter";
import { HasuraLikeService } from "./like.adapter";
import { SchoolHasuraService } from "./school.adapter";
import { HasuraCohortService } from "./cohort.adapter";
import { HasuraCohortMembersService } from "./cohortMembers.adapter";
import { HasuraFieldsService } from "./fields.adapter";
import { FieldsService } from "./services/fields.service";

@Module({
  imports: [HttpModule],
  providers: [
    AttendanceHasuraService,
    SchoolHasuraService,
    HasuraGroupService,
    HasuraCohortService,
    HasuraCohortMembersService,
    HasuraCommentService,
    HasuraConfigService,
    HasuraLikeService,
    HasuraHolidayService,
    HasuraFieldsService,
    FieldsService,
  ],
  exports: [
    AttendanceHasuraService,
    SchoolHasuraService,
    HasuraGroupService,
    HasuraCohortService,
    HasuraCohortMembersService,
    HasuraCommentService,
    HasuraConfigService,
    HasuraLikeService,
    HasuraHolidayService,
    HasuraFieldsService,
  ],
})
export class HasuraModule {}
