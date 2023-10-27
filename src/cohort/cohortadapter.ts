import { Injectable } from "@nestjs/common";
import { IServicelocatorcohort } from "src/adapters/cohortservicelocator";
import { HasuraCohortService } from "src/adapters/hasura/cohort.adapter";

@Injectable()
export class CohortAdapter {
  constructor(private hasuraProvider: HasuraCohortService) {}
  buildCohortAdapter(): IServicelocatorcohort {
    let adapter: IServicelocatorcohort;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
