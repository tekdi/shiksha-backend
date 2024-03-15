import { CacheModule, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { HttpModule } from "@nestjs/axios";
import { UserAdapter } from "./useradapter";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user-create-entity";
import { UsersService1 } from "./user.service";
import { FieldValue } from "./entities/field-entities";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      FieldValue
    ]),
    HttpModule,
    SunbirdModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [UserController],
  providers: [UserAdapter,UsersService1],
})
export class UserModule {}
