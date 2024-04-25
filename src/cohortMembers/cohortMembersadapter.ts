import { Injectable } from "@nestjs/common";
import { IServicelocatorcohortMembers } from "src/adapters/cohortMembersservicelocator";
import { HasuraCohortMembersService } from "src/adapters/hasura/cohortMembers.adapter";
import { PostgresCohortMembersService } from "src/adapters/postgres/cohortMembers-adapter";

@Injectable()
export class CohortMembersAdapter {
  constructor(
    private hasuraProvider: HasuraCohortMembersService,
    private postgresProvider: PostgresCohortMembersService
  ) {}
  buildCohortMembersAdapter(): IServicelocatorcohortMembers {
    let adapter: IServicelocatorcohortMembers;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "postgres":
        adapter = this.postgresProvider;
    }
    return adapter;
  }
}
