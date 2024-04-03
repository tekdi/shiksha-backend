import { CacheModule, Module } from "@nestjs/common";
import { SchoolController } from "./school.controller";
import { HttpModule } from "@nestjs/axios";
import { SchoolAdapter } from "./schooladapter";
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
  controllers: [SchoolController],
  providers: [SchoolAdapter],
})
export class SchoolModule {}
