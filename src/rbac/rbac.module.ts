import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
// import { RoleService } from "src/adapters/hasura/role.adapter";
import { RoleController } from "./rbac.controller";
import { Role } from "./entities/rbac.entity";
import { RoleService } from "./rbac.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    HttpModule
  ],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
