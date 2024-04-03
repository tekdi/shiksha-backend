import { CacheModule, Module } from "@nestjs/common";
import { ConfigController } from "./config.controller";
import { HttpModule } from "@nestjs/axios";
import {
  HasuraConfigService,
  HasuraConfigToken,
} from "src/adapters/hasura/config.adapter";
import { ConfigsAdapter } from "./configsadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";

@Module({
  imports: [HasuraModule, HttpModule],
  controllers: [ConfigController],
  providers: [ConfigsAdapter],
})
export class ConfigurationModule {}
