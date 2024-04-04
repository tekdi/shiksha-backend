import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { ScheduleModule } from "@nestjs/schedule";
import { AttendaceAdapter } from "./attendanceadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { AttendanceService } from "./attendance.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttendanceEntity } from "./entities/attendance.entity";
import { Repository } from "typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceEntity]),
    HasuraModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AttendanceController],
  providers: [AttendaceAdapter, AttendanceService, Repository],
})
export class AttendanceModule {}
