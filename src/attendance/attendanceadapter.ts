import { Inject, Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/attendanceservicelocator";
import { AttendanceHasuraService } from "src/adapters/hasura/attendance.adapter";
import { AttendanceService } from "src/adapters/sunbirdrc/attendance.adapter";

@Injectable()
export class AttendaceAdapter {
  constructor(
    private hasuraProvider: AttendanceHasuraService,
    private sunbirdProvider: AttendanceService
  ) {}
  buildAttenceAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "sunbird":
        adapter = this.sunbirdProvider;
        break;
    }
    return adapter;
  }
}
