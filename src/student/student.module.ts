import { CacheModule, Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { HttpModule } from "@nestjs/axios";
import { StudentAdapter } from "./studentadapter";

const ttl = process.env.TTL as never;
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: ttl,
    }),
  ],
  controllers: [StudentController],
  providers: [StudentAdapter],
})
export class StudentModule {}
