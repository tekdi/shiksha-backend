import { Injectable } from "@nestjs/common";
import { HasuraLikeService } from "src/adapters/hasura/like.adapter";
import { IServicelocator } from "src/adapters/likeservicelocator";

@Injectable()
export class LikeAdapter {
  constructor(private hasuraProvider: HasuraLikeService) {}
  buildLikeAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
