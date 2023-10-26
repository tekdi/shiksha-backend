import { Injectable } from "@nestjs/common";
import { EsamwadCohortService } from "src/adapters/esamwad/cohort.adapter";
import { IServicelocatorcohort } from "src/adapters/cohortservicelocator";
import { HasuraCohortService } from "src/adapters/hasura/cohort.adapter";
import { SunbirdCohortService } from "src/adapters/sunbirdrc/cohort.adapter";

@Injectable()
export class CohortAdapter {
  constructor(
    private eSamwadProvider: EsamwadCohortService,
    private sunbirdProvider: SunbirdCohortService,
    private hasuraProvider: HasuraCohortService
  ) {}
  buildCohortAdapter(): IServicelocatorcohort {
    let adapter: IServicelocatorcohort;

    switch (process.env.ADAPTERSOURCE) {
      case "esamwad":
        adapter = this.eSamwadProvider;
        break;
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
