import { Injectable } from "@nestjs/common";
import { IServicelocatorcohortMembers } from "src/adapters/cohortMembersservicelocator";
import { HasuraCohortMembersService } from "src/adapters/hasura/cohortMembers.adapter";

@Injectable()
export class CohortMembersAdapter {
  constructor(private hasuraProvider: HasuraCohortMembersService) {}
  buildCohortMembersAdapter(): IServicelocatorcohortMembers {
    let adapter: IServicelocatorcohortMembers;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
