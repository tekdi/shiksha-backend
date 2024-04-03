import { Injectable } from "@nestjs/common";
import { IServicelocatorgroup } from "src/adapters/groupservicelocator";
import { HasuraGroupService } from "src/adapters/hasura/group.adapter";

@Injectable()
export class GroupAdapter {
  constructor(private hasuraProvider: HasuraGroupService) {}
  buildGroupAdapter(): IServicelocatorgroup {
    let adapter: IServicelocatorgroup;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
