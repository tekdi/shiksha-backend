import { CacheModule, Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { AttendaceAdapter } from "./attendanceadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
import { AttendanceService } from "./attendance.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttendanceEntity } from "./entities/attendance.entity";
import { Repository } from "typeorm";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceEntity
    ]),
    SunbirdModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AttendanceController],
  providers: [AttendaceAdapter,AttendanceService,Repository],
})
export class AttendanceModule {}
