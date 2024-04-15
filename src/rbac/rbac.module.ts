import { Module } from "@nestjs/common";
import { RoleModule } from "./role/role.module";
import { PrivilegeModule } from './privilege/privilege.module';
import { AssignRoleModule } from './assign-role/assign-role.module';
import { AssignPrivilegeModule } from "./assign-privilege/assign-privilege.module";

@Module({
    imports: [
    RoleModule,
    PrivilegeModule,
    AssignRoleModule,
    AssignPrivilegeModule
  ],
})
export class RbacModule {}
