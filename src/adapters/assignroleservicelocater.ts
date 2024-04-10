import { CreateAssignRoleDto } from "src/rbac/assign-role/dto/create-assign-role.dto";

export interface IServicelocatorassignRole {
    createAssignRole(request: any, createAssignRoleDto:CreateAssignRoleDto);
    getassignedRole(userId, request);
    deleteassignedRole(roleId);
}