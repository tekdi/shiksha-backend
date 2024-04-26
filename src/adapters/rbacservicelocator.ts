import { RoleSearchDto } from "../rbac/role/dto/role-search.dto";
import { CreateRolesDto, RoleDto } from "../rbac/role/dto/role.dto";

export interface IServicelocatorRbac {
    getRole(
        roleId?: string,
        request?: any,
    );
    updateRole(id?: string, request?: any, userDto?: any);
    createRole(request: any, createRolesDto: CreateRolesDto);
    searchRole(roleSearchDto: RoleSearchDto);
    deleteRole(roleId);
}
