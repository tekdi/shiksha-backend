import { Injectable } from "@nestjs/common";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";
import { IServicelocator } from "src/adapters/userservicelocator";

@Injectable()
export class UserAdapter {
  constructor(private hasuraProvider: HasuraUserService) {}
  buildUserAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
