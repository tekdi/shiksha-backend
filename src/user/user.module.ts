import { CacheModule, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { HttpModule } from "@nestjs/axios";
import { UserAdapter } from "./useradapter";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    SunbirdModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [UserController],
  providers: [UserAdapter],
})
export class UserModule {}
