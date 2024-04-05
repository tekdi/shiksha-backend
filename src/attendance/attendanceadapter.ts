import { Inject, Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/attendanceservicelocator";
import { AttendanceHasuraService } from "src/adapters/hasura/attendance.adapter";
import { PostgresAttendanceService } from "src/adapters/postgres/attendance-adapter";

@Injectable()
export class AttendaceAdapter {
  constructor(private hasuraProvider: AttendanceHasuraService,private postgresProvider:PostgresAttendanceService) {}
  buildAttenceAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "postgres":
        adapter = this.postgresProvider;
        break;
    }
    return adapter;
  }
}
