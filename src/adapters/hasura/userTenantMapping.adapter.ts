import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserTenantMapping } from 'src/userTenantMapping/entities/user-tenant-mapping.entity';
import { UserTenantMappingDto } from "src/userTenantMapping/dto/user-tenant-mapping.dto";
import { IServicelocatorAssignTenant } from '../usertenantmappinglocator';

@Injectable()
export class HasuraAssignTenantService implements IServicelocatorAssignTenant {
    constructor(
        @InjectRepository(UserTenantMapping)
        private userTenantMappingRepository: Repository<UserTenantMapping>,

    ) { }
    public async userTenantMapping(request: any, assignTenantMappingDto:UserTenantMappingDto) {
    }

}
