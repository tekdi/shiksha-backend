import { RoleSearchDto } from "../rbac/dto/rbac-search.dto";
import { RoleDto } from "../rbac/dto/rbac.dto";

export interface IServicelocatorRbac {
    getRole(
        roleId?: Record<string, string>,
        request?: any,
    );
    updateRole(id?: string, request?: any, userDto?: any);
    createRole(request: any, roleDto: RoleDto);
    searchRole(tenantid, request: any, roleSearchDto: RoleSearchDto)
}
