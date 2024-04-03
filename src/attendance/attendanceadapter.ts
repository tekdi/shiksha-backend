import { Inject, Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/attendanceservicelocator";
import { AttendanceHasuraService } from "src/adapters/hasura/attendance.adapter";

@Injectable()
export class AttendaceAdapter {
  constructor(private hasuraProvider: AttendanceHasuraService) {}
  buildAttenceAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
