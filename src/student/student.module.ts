import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { HttpModule } from "@nestjs/axios";
import { StudentAdapter } from "./studentadapter";

@Module({
  imports: [HttpModule],
  controllers: [StudentController],
  providers: [StudentAdapter],
})
export class StudentModule {}
