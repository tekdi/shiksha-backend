import {
  CreatePrivilegesDto,
  PrivilegeDto,
} from "src/rbac/privilege/dto/privilege.dto";

export interface IServicelocator {
    createPrivilege(loggedinUser: any, createPrivileges: CreatePrivilegesDto);
    getPrivilege(
        privilegeId?: string,
        request?: any,
    );
    // updatePrivilege(privilegeId, request, privilegeDto)
    getAllPrivilege(request:any)
    getPrivilegebyRoleId(tenantId:string, roleId:string,request:any)
  // updatePrivilege(privilegeId, request, privilegeDto)
  deletePrivilege(privilegeId);
}
