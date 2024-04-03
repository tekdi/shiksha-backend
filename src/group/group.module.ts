import { CacheModule, Module } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { HttpModule } from "@nestjs/axios";
import { GroupAdapter } from "./groupadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [GroupController],
  providers: [GroupAdapter],
})
export class GroupModule {}
