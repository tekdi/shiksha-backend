import { CacheModule, Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { HttpModule } from "@nestjs/axios";
import { StudentAdapter } from "./studentadapter";
import { SunbirdModule } from "src/adapters/sunbirdrc/subnbird.module";
const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    SunbirdModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [StudentController],
  providers: [StudentAdapter],
})
export class StudentModule {}
