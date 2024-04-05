import { Injectable } from "@nestjs/common";
import { IServicelocatorfields } from "src/adapters/fieldsservicelocator";
import { HasuraFieldsService } from "src/adapters/hasura/fields.adapter";
import { PostgresFieldsService } from "src/adapters/postgres/fields-adapter";

@Injectable()
export class FieldsAdapter {
  constructor(private hasuraProvider: HasuraFieldsService,private postgresProvider:PostgresFieldsService) {}
  buildFieldsAdapter(): IServicelocatorfields {
    let adapter: IServicelocatorfields;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
      case "postgres":
        adapter = this.postgresProvider;
        break;
    }
    return adapter;
  }
}
