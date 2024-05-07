import { UserTenantMappingDto } from "src/userTenantMapping/dto/user-tenant-mapping.dto";
export interface IServicelocatorassignTenant {
    userTenantMapping(request: any, assignTenantMappingDto:UserTenantMappingDto);
}