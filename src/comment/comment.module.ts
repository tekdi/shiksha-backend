import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { CommentController } from "./comment.controller";
import { CommentAdapter } from "./commentadapter";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HasuraModule,
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [CommentController],
  providers: [CommentAdapter],
})
export class CommentModule {}
