import { Injectable } from "@nestjs/common";
import { HasuraPrivilegeService } from "src/adapters/hasura/rbac/privilege.adapter";
import { IServicelocator } from "src/adapters/privilegeservicelocator";
import { PostgresPrivilegeService } from "src/adapters/postgres/rbac/privilege-adapter";

@Injectable()
export class PrivilegeAdapter {
  constructor(private hasuraProvider: HasuraPrivilegeService,
    private postgresProvider:PostgresPrivilegeService) {}
  buildPrivilegeAdapter(): IServicelocator {
    let adapter: IServicelocator;

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
