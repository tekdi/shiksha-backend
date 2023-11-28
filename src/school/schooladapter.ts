import { Injectable } from "@nestjs/common";
import { SchoolHasuraService } from "src/adapters/hasura/school.adapter";
import { IServicelocator } from "src/adapters/schoolservicelocator";
import { SchoolService } from "src/adapters/sunbirdrc/school.adapter";

@Injectable()
export class SchoolAdapter {
  constructor(
    private sunbirdProvider: SchoolService,
    private hasuraProvider: SchoolHasuraService
  ) {}
  buildSchoolAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "sunbird":
        adapter = this.sunbirdProvider;
        break;
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
