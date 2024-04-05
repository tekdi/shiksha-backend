import { Injectable } from "@nestjs/common";
import { IServicelocatorRbac } from "../adapters/rbacservicelocator";
import { HasuraRoleService } from "../adapters/hasura/role.adapter";
import { PostgresRbacService } from "../adapters/postgres/rbac-adapter";




@Injectable()
export class RbacAdapter {
  constructor(private hasuraProvider: HasuraRoleService,
    private postgresProvider:PostgresRbacService) {}
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
