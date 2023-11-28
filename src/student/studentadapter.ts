import { Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/studentservicelocator";
import { StudentService } from "src/adapters/sunbirdrc/student.adapter";

@Injectable()
export class StudentAdapter {
  constructor(
    private sunbirdProvider: StudentService
  ) {}
  buildStudentAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.REGISTYADAPTER) {
      case "sunbird":
        adapter = this.sunbirdProvider;
        break;
    }
    return adapter;
  }
}
