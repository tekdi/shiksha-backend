import { Injectable } from "@nestjs/common";
import { PostgresProgramsRoleMappingService } from './../../adapters/postgres/rbac/programRoleMapping-adapter';
import { HasuraProgramsRoleMappingService } from './../../adapters/hasura/rbac/programRoleMapping.adapter';
import {IServicelocator} from '../../adapters/programRoleMappingservicelocater'

@Injectable()
export class ProgramRoleMappingAdapter {
  constructor(private hasuraProvider: HasuraProgramsRoleMappingService,private postgresProvider:PostgresProgramsRoleMappingService) {}
  buildProgramRoleMappingAdapter(): IServicelocator {
    let adapter: IServicelocator;
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