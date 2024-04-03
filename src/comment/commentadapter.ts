import { Injectable } from "@nestjs/common";
import { IServicelocator } from "src/adapters/commentservicelocator";
import { HasuraCommentService } from "src/adapters/hasura/comment.adapter";

@Injectable()
export class CommentAdapter {
  constructor(private hasuraProvider: HasuraCommentService) {}
  buildCommentAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.ADAPTERSOURCE) {
      case "hasura":
        adapter = this.hasuraProvider;
        break;
    }
    return adapter;
  }
}
