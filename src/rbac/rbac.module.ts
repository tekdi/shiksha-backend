import { Module } from "@nestjs/common";
import { RoleModule } from "./role/role.module";
import { PrivilegeModule } from './privilege/privilege.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Privilege } from "./privilege/entities/privilege.entity";
import { Role } from "./role/entities/rbac.entity";

@Module({
    imports: [
    RoleModule,
    PrivilegeModule
  ],
})
export class RbacModule {}
