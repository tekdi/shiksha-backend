import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AttendanceHasuraService } from "./attendance.adapter";
import { HasuraCommentService } from "./comment.adapter";
import { HasuraConfigService } from "./config.adapter";
import { HasuraLikeService } from "./like.adapter";
import { HasuraCohortService } from "./cohort.adapter";
import { HasuraCohortMembersService } from "./cohortMembers.adapter";
import { HasuraFieldsService } from "./fields.adapter";
import { FieldsService } from "./services/fields.service";
import { HasuraUserService } from "./user.adapter";

@Module({
  imports: [HttpModule],
  providers: [
    AttendanceHasuraService,
    HasuraCohortService,
    HasuraCohortMembersService,
    HasuraCommentService,
    HasuraConfigService,
    HasuraLikeService,
    HasuraFieldsService,
    FieldsService,
    HasuraUserService,
  ],
  exports: [
    AttendanceHasuraService,
    HasuraCohortService,
    HasuraCohortMembersService,
    HasuraCommentService,
    HasuraConfigService,
    HasuraLikeService,
    HasuraFieldsService,
    HasuraUserService,
  ],
})
export class HasuraModule {}
