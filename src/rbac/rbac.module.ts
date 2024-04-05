import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
// import { RoleService } from "src/adapters/hasura/role.adapter";
import { RoleController } from "./rbac.controller";
import { Role } from "./entities/rbac.entity";
import { RoleService } from "./rbac.service";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostgresModule } from "src/adapters/postgres/potsgres-module";
import { PostgresRbacService } from "src/adapters/postgres/rbac-adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    HttpModule,
    PostgresModule

  ],
  controllers: [RoleController],
  providers: [RoleService,PostgresRbacService],
})
export class RoleModule {}
