import { CacheModule, Module } from "@nestjs/common";
import { FieldsController } from "./fields.controller";
import { HttpModule } from "@nestjs/axios";
import { FieldsAdapter } from "./fieldsadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { EsmwadModule } from "src/adapters/esamwad/esamwad.module";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    SunbirdModule,
    HasuraModule,
    EsmwadModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [FieldsController],
  providers: [FieldsAdapter],
})
export class FieldsModule {}
