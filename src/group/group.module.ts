import { Module } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { HttpModule } from "@nestjs/axios";
import { GroupAdapter } from "./groupadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";

@Module({
  imports: [HttpModule, HasuraModule],
  controllers: [GroupController],
  providers: [GroupAdapter],
})
export class GroupModule {}
