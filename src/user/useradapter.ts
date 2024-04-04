import { Injectable } from "@nestjs/common";
import { HasuraUserService } from "src/adapters/hasura/user.adapter";
import { IServicelocator } from "src/adapters/userservicelocator";
import { PostgresUserService } from "src/adapters/postgres/user-adapter";

@Injectable()
export class UserAdapter {
  constructor(private hasuraProvider: HasuraUserService,
    private postgresProvider:PostgresUserService) {}
  buildUserAdapter(): IServicelocator {
    let adapter: IServicelocator;

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
