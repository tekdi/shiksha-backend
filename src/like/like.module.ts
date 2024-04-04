import { HttpModule } from "@nestjs/axios";
import { CacheModule, Module } from "@nestjs/common";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { LikeController } from "./like.controller";
import { LikeAdapter } from "./likeadapter";

@Module({
  imports: [HasuraModule, HttpModule],
  controllers: [LikeController],
  providers: [LikeAdapter],
})
export class LikeModule {}
