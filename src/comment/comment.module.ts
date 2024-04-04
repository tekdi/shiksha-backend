import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { CommentController } from "./comment.controller";
import { CommentAdapter } from "./commentadapter";

@Module({
  imports: [HasuraModule, HttpModule],
  controllers: [CommentController],
  providers: [CommentAdapter],
})
export class CommentModule {}
