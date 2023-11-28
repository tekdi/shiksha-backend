import { CacheModule, Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { AttendaceAdapter } from "./attendanceadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    SunbirdModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AttendanceController],
  providers: [AttendaceAdapter],
})
export class AttendanceModule {}
