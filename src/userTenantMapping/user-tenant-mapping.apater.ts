import { Injectable } from "@nestjs/common";
import { PostgresAssignTenantService } from "src/adapters/postgres/usertenantmapping-adapter";
import { HasuraAssignTenantService } from "src/adapters/hasura/usertenantmapping.adapter";
import { IServicelocatorassignTenant } from "src/adapters/usertenantmappinglocator";

@Injectable()
export class AssignTenantAdapter {
  constructor(private hasuraProvider: HasuraAssignTenantService,
    private postgresProvider:PostgresAssignTenantService) {}
    buildAssignTenantAdapter(): IServicelocatorassignTenant {
    let adapter: IServicelocatorassignTenant;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "postgres":
        adapter = this.postgresProvider;
        break;
      default:
        throw new Error("Invalid ADAPTERSOURCE environment variable. Please specify either 'hasura' or 'postgres'.");
    }
    return adapter;
  }
}
