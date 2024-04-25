import { CreatePrivilegesDto, PrivilegeDto } from "src/rbac/privilege/dto/privilege.dto";

export interface IServicelocator {
    createPrivilege(loggedinUser: any, createPrivileges: CreatePrivilegesDto);
    getPrivilege(
        privilegeId?: string,
        request?: any,
    );
    // updatePrivilege(privilegeId, request, privilegeDto)
    getAllPrivilege(request)
    deletePrivilege(privilegeId, request)
}
