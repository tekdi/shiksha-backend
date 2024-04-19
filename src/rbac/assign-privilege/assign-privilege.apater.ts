import { Injectable } from "@nestjs/common";
import { PostgresAssignPrivilegeService } from "src/adapters/postgres/rbac/privilegerole.adapter";
import { HasuraAssignPrivilegeService } from "src/adapters/hasura/rbac/privilegerole.adapter";
import { IServicelocatorassignRole } from "src/adapters/assignroleservicelocater";
import { IServicelocatorprivilegeRole } from "src/adapters/assignprivilegelocater";

@Injectable()
export class AssignPrivilegeAdapter {
  constructor(private hasuraProvider: HasuraAssignPrivilegeService,
    private postgresProvider:PostgresAssignPrivilegeService) {}
  buildPrivilegeRoleAdapter(): IServicelocatorprivilegeRole {
    let adapter: IServicelocatorprivilegeRole;

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
