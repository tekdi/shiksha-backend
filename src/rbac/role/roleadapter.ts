import { Injectable } from "@nestjs/common";
import { IServicelocatorRbac } from "../../adapters/rbacservicelocator";
import { HasuraRoleService } from "../../adapters/hasura/rbac.adapter";
import { PostgresRoleService } from "../../adapters/postgres/rbac/role-adapter";

@Injectable()
export class RoleAdapter {
  constructor(private hasuraProvider: HasuraRoleService,
    private postgresProvider:PostgresRoleService) {}
  buildRbacAdapter(): IServicelocatorRbac {
    let adapter: IServicelocatorRbac;

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
