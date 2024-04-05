import { Injectable } from "@nestjs/common";
import { IServicelocatorcohort } from "src/adapters/cohortservicelocator";
import { HasuraCohortService } from "src/adapters/hasura/cohort.adapter";
import { PostgresCohortService } from "src/adapters/postgres/cohort-adapter";

@Injectable()
export class CohortAdapter {
  constructor(private hasuraProvider: HasuraCohortService,private postgresProvider:PostgresCohortService) {}
  buildCohortAdapter(): IServicelocatorcohort {
    let adapter: IServicelocatorcohort;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "hasura":
        adapter = this.postgresProvider;
        break;
    }
    return adapter;
  }
}
