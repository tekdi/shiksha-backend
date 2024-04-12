import { Module } from "@nestjs/common";
import { RoleModule } from "./role/role.module";
import { PrivilegeModule } from './privilege/privilege.module';
import { AssignRoleModule } from './assign-role/assign-role.module';
import { ProgramsRoleMappingModule } from './programs-role-mapping/programs-role-mapping.module';

@Module({
    imports: [
    RoleModule,
    PrivilegeModule,
    AssignRoleModule,
    ProgramsRoleMappingModule,
  ],
})

export class RbacModule {}
