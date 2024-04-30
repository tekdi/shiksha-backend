import { CreateAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-create.dto";
import { UpdateAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-update.dto";
export interface IServicelocatorassignTenant {
    createAssignTenant(request: any, createAssignTenantDto:CreateAssignTenantDto);
    // updateAssignTenant(request: any, updateAssignTenantDto:UpdateAssignTenantDto);
}