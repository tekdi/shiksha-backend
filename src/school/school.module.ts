import { CacheModule, Module } from "@nestjs/common";
import { SchoolController } from "./school.controller";
import { HttpModule } from "@nestjs/axios";
import { SchoolAdapter } from "./schooladapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";

@Module({
  imports: [HttpModule, HasuraModule],
  controllers: [SchoolController],
  providers: [SchoolAdapter],
})
export class SchoolModule {}
