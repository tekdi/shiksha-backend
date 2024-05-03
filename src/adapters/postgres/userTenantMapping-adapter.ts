import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserTenantMapping } from 'src/userTenantMapping/entities/user-tenant-mapping.entity';
import { AssignTenantMappingDto,ResponseAssignTenantDto } from "src/userTenantMapping/dto/user-tenant-mapping.dto";
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { SuccessResponse } from 'src/success-response';
import { User } from "src/user/entities/user-entity";
import { Tenants } from "src/userTenantMapping/entities/tenant.entity";


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

    private async validateUserTenantMapping(userId: string, tenantId: string, errors: any[]) {
        // check if user tenant mapping exists.
        const existingMapping = await this.userTenantMappingRepository.findOne({
            where: { userId, tenantId },
        });
        if (existingMapping) {
            errors.push({
                errorMessage: `User already exists in Tenant ${tenantId}.`,
            });
            return false;
        }

        // check if user exists
        const userExist = await this.userRepository.findOne({ where: { userId } });
        if (!userExist) {
            errors.push({ errorMessage: `User ${userId} does not exist.` });
            return false;
        }
    
        // check if tenant exists
        const tenantExist = await this.tenantsRepository.findOne({ where: { tenantId } });
        if (!tenantExist) {
            errors.push({ errorMessage: `Tenant ${tenantId} does not exist.` });
            return false;
        }
    
        return true;
    }
    
    public async userTenantMapping(request: any, assignTenantMappingDto: AssignTenantMappingDto) {
        try {

            const userId = assignTenantMappingDto.userId;
            const tenantIds = assignTenantMappingDto.tenantId;

            // Check if tenant array is not empty
            if (!tenantIds || tenantIds.length === 0) {
                return new SuccessResponse({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Please provide at least one tenant Id",
                });
            }

            let result = [];
            let errors = [];

            for (const tenantId of tenantIds) {
                const isValid = await this.validateUserTenantMapping(userId, tenantId, errors);

                if (!isValid) {
                    continue;
                }

                const data = await this.userTenantMappingRepository.save({
                    userId: userId,
                    tenantId: tenantId,
                    createdBy: request['user'].userId,
                    updatedBy: request['user'].userId
                })

                result.push(new ResponseAssignTenantDto(data, `User is successfully added to the Tenants.`));
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
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: JSON.stringify(error)
            });
        }
    }

}
