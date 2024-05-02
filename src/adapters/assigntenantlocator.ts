import { CreateAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-create.dto";
export interface IServicelocatorassignTenant {
    createAssignTenant(request: any, createAssignTenantDto:CreateAssignTenantDto);
}