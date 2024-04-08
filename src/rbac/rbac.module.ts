import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
// import { RoleService } from "src/adapters/hasura/role.adapter";
import { RoleController } from "./rbac.controller";
import { Role } from "./entities/rbac.entity";
import { RoleService } from "./rbac.service";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { PostgresRbacService } from "src/adapters/postgres/rbac-adapter";
// import { RbacAdapter } from "./rbacadapter";
import { HasuraModule } from "src/adapters/hasura/hasura.module";
import { HasuraRoleService } from "src/adapters/hasura/rbac.adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    HttpModule,
    PostgresModule,
    HasuraModule
  ],
  controllers: [RoleController],
  providers: [RoleService,PostgresRbacService,HasuraRoleService],
})
export class RoleModule {}
