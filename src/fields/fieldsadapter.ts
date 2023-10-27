import { Injectable } from "@nestjs/common";
import { IServicelocatorfields } from "src/adapters/fieldsservicelocator";
import { HasuraFieldsService } from "src/adapters/hasura/fields.adapter";

@Injectable()
export class FieldsAdapter {
  constructor(private hasuraProvider: HasuraFieldsService) {}
  buildFieldsAdapter(): IServicelocatorfields {
    let adapter: IServicelocatorfields;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
