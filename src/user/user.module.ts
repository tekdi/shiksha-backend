import { CacheModule, Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { HttpModule } from "@nestjs/axios";
import { UserAdapter } from "./useradapter";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user-entity";
import { UserService } from "./user.service";
import { FieldValues } from "./entities/field-value-entities";
import { Field } from "./entities/field-entity";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      FieldValues,
      Field
    ]),
    HttpModule,
    SunbirdModule,
    HasuraModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [UserController],
  providers: [UserAdapter,UserService],
})
export class UserModule {}
