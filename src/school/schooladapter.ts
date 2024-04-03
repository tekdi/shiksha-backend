import { Injectable } from "@nestjs/common";
import { SchoolHasuraService } from "src/adapters/hasura/school.adapter";
import { IServicelocator } from "src/adapters/schoolservicelocator";

@Injectable()
export class SchoolAdapter {
  constructor(private hasuraProvider: SchoolHasuraService) {}
  buildSchoolAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
