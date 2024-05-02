import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
// import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
import { UserTenantMapping } from 'src/assign-tenant/entities/assign-tenant.entity';
import { Role } from "src/rbac/role/entities/role.entity";
import { CreateAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-create.dto";

@Injectable()
export class HasuraAssignTenantService {
    constructor(
        @InjectRepository(UserTenantMapping)
        private userTenantMappingRepository: Repository<UserTenantMapping>,

    ) { }
    public async createAssignTenant(request: any, createAssignTenantDto:CreateAssignTenantDto) {
    }

}
