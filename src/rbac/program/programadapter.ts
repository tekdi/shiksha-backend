import { Injectable } from "@nestjs/common";
import { IServicelocatorProgram } from "src/adapters/programservicelocator";
import { HasuraProgramService } from "../../adapters/hasura/rbac/program.adapter";

import { PostgresProgramService } from "../../adapters/postgres/rbac/program-adapter";

@Injectable()
export class ProgramAdapter {
  constructor(
    private hasuraProvider: HasuraProgramService,
    private postgresProvider: PostgresProgramService
  ) {}
  buildProgramAdapter(): IServicelocatorProgram {
    let adapter: IServicelocatorProgram;

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
