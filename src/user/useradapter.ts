import { Injectable } from "@nestjs/common";
import { EsamwadUserService } from "src/adapters/esamwad/user.adapter";
import { UserService } from "src/adapters/sunbirdrc/user.adapter";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";
import { IServicelocator } from "src/adapters/userservicelocator";

@Injectable()
export class UserAdapter {
  constructor(
    private eSamwadProvider: EsamwadUserService,
    private sunbirdProvider: UserService,
    private hasuraProvider: HasuraUserService
  ) {}
  buildUserAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.REGISTYADAPTER) {
      case "esamwad":
        adapter = this.eSamwadProvider;
        break;
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
