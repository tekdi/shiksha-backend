import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserTenantMapping } from 'src/assign-tenant/entities/assign-tenant.entity';
import { CreateAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-create.dto";
import { ResponseAssignTenantDto } from "src/assign-tenant/dto/assign-tenant-create.dto";
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { SuccessResponse } from 'src/success-response';
import { User } from "src/user/entities/user-entity";
import { Tenants } from "src/assign-tenant/entities/tenant.entity";


@Injectable()
export class PostgresAssignTenantService {
    constructor(
        @InjectRepository(UserTenantMapping)
        private userTenantMappingRepository: Repository<UserTenantMapping>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Tenants)
        private tenantsRepository: Repository<Tenants>,
    ) { }
    public async createAssignTenant(request: any, createAssignTenantDto: CreateAssignTenantDto) {
        try {

            const userId = createAssignTenantDto.userId;
            const tenantIds = createAssignTenantDto.tenantId;

            // Check if tenant array is not empty
            if (!tenantIds || tenantIds.length === 0) {
                return new SuccessResponse({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Roles array cannot be empty.",
                });
            }
            let result = [];
            let errors = [];

            for (const tenantId of tenantIds) {
                // If role already exists for user, return error response
                console.log(userId);
                console.log(tenantId);

                let findExistingRole = await this.userTenantMappingRepository.findOne({
                    where: {
                        userId: userId,
                        tenantId: tenantId,
                    },
                });
                if (findExistingRole) {
                    errors.push({
                        errorMessage: `User is already exist in ${tenantId} Tenant.`,
                    });
                    continue;
                }

                // User is exist in user table 
                let userExist = await this.userRepository.findOne({
                    where: {
                        userId: userId,
                    },
                });
                if (!userExist) {
                    errors.push({
                        errorMessage: `User ${userId} is not exist.`,
                    });
                    continue;
                }

                // User is exist in user table 
                let tenantExist = await this.tenantsRepository.findOne({
                    where: {
                        tenantId: tenantId,
                    },
                });
                if (!tenantExist) {
                    errors.push({
                        errorMessage: `Tenant ${tenantId} is not exist.`,
                    });
                    continue;
                }


                const data = await this.userTenantMappingRepository.save({
                    userId: userId,
                    tenantId: tenantId,
                    createdBy: request['user'].userId,
                    updatedBy: request['user'].userId
                })

                result.push(new ResponseAssignTenantDto(data, `Tenant assigned successfully to the user.`));
            }

            if (result.length == 0) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorCount: errors.length,
                    errors,
                };
            }
            return {
                statusCode: HttpStatus.CREATED,
                successCount: result.length,
                errorCount: errors.length,
                data: result,
                errors,
            };
        } catch (error) {
            if (error.code === '23503') {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.NOT_FOUND,
                    errorMessage: `User Id or Role Id Doesn't Exist in Database `
                });
            }
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: JSON.stringify(error)
            });
        }
    }

}
