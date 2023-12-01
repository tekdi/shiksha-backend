import { Injectable } from "@nestjs/common";
import { IServicelocatorgroup } from "src/adapters/groupservicelocator";
import { HasuraGroupService } from "src/adapters/hasura/group.adapter";
import { SunbirdGroupService } from "src/adapters/sunbirdrc/group.adapter";

@Injectable()
export class GroupAdapter {
  constructor(
    private sunbirdProvider: SunbirdGroupService,
    private hasuraProvider: HasuraGroupService
  ) {}
  buildGroupAdapter(): IServicelocatorgroup {
    let adapter: IServicelocatorgroup;

    switch (process.env.ADAPTERSOURCE) {
      case "sunbird":
        adapter = this.sunbirdProvider;
        break;
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
