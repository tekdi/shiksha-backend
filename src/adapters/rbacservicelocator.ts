import { RoleSearchDto } from "../rbac/role/dto/role-search.dto";
import { RoleDto } from "../rbac/role/dto/role.dto";

export interface IServicelocatorRbac {
    getRole(
        roleId?: string,
        request?: any,
    );
    updateRole(id?: string, request?: any, userDto?: any);
    createRole(request: any, roleDto: RoleDto);
    searchRole(tenantid, request: any, roleSearchDto: RoleSearchDto);
    deleteRole(roleId);
}
