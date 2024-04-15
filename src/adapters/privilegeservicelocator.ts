import { PrivilegeDto } from "src/rbac/privilege/dto/privilege.dto";

export interface IServicelocator {
    createPrivilege(request: any, privilegeDto: PrivilegeDto);
    getPrivilege(
        privilegeId?: string,
        request?: any,
    );
    updatePrivilege(privilegeId, request, privilegeDto)
    getAllPrivilege(request)
    deletePrivilege(privilegeId, request, privilegeDto)
   

}
