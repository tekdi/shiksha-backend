import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { RoleService } from "src/adapters/hasura/role.adapter";
import { RoleController } from "./role.controller";

@Module({
  imports: [HttpModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
