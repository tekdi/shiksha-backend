import { Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/configservicelocator";
import { HasuraConfigService } from "src/adapters/hasura/config.adapter";

@Injectable()
export class ConfigsAdapter {
  constructor(private hasuraProvider: HasuraConfigService) {}
  buildConfigsAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
