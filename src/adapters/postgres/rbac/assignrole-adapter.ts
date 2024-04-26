import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { CreateAssignRoleDto, ResponseAssignRoleDto } from 'src/rbac/assign-role/dto/create-assign-role.dto';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
import { Role } from "src/rbac/role/entities/role.entity";
import { IsAlpha, IsUUID, isUUID } from 'class-validator';
import { executionAsyncResource } from 'async_hooks';
import jwt_decode from "jwt-decode";


@Injectable()
export class PostgresAssignroleService {
    constructor(
        @InjectRepository(UserRoleMapping)
        private userRoleMappingRepository: Repository<UserRoleMapping>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) { }
    public async createAssignRole(request: Request, createAssignRoleDto: CreateAssignRoleDto) {
        try {
            // const decoded: any = jwt_decode(request.headers.authorization);
            const userId = createAssignRoleDto.userId;
            const roles = createAssignRoleDto.roleId;
            const tenantId = createAssignRoleDto.tenantId;

            // Check if roles array is not empty
            if (!roles || roles.length === 0) {
                return new SuccessResponse({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Roles array cannot be empty.",
                });
            }
            let result = [];
            let errors = [];

            for (const roleId of roles) {
                // If role already exists for user, return error response
                let findExistingRole = await this.userRoleMappingRepository.findOne({
                    where: {
                        userId: userId,
                        roleId: roleId,
                    },
                });
                if (findExistingRole) {
                    errors.push({
                        errorMessage: `Role ${roleId} is already assigned to this user.`,
                    });
                    continue;
                }

                //Rele is belong for this tenent
                let roleExistforTenant = await this.roleRepository.findOne({
                    where: {
                        roleId: roleId,
                        tenantId: tenantId,
                    },
                });
                if (!roleExistforTenant) {
                    errors.push({
                        errorMessage: `Role ${roleId} is not exist for this tenant.`,
                    });
                    continue;
                }

                const data = await this.userRoleMappingRepository.save({
                    userId: userId,
                    roleId: roleId,
                    tenantId: tenantId,
                    createdBy: request['user'].userId,
                    updatedBy: request['user'].userId
                })
                result.push(new ResponseAssignRoleDto(data, `Role assigned successfully to the user in the specified tenant.`));
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

    public async getAssignedRole(userId: string, request: Request) {
        try {
            if (!isUUID(userId)) {
                return new SuccessResponse({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Please Enter Valid User ID',
                });
            }
            let result = await this.checkExistingRole(userId);
            if (!result) {
                return new SuccessResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'No Role assigned to user',
                    data: result,
                });
            }
            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                data: result,
            });
        } catch (error) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });
        }

    }

    public async deleteAssignedRole(userId) {
        try {
            let result = await this.checkExistingRole(userId);
            if (!result) {
                return new SuccessResponse({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'No Role assigned to user',
                    data: result,
                });
            }
            let response = await this.userRoleMappingRepository.delete(userId)
            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Role deleted successfully.',
                data: {
                    rowCount: response.affected,
                }
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    //    async checkAndAddUserRole(data){
    //     let existingUser = await this.checkExistingRole(data.userId) ;
    //     if(existingUser){
    //         let update  = 
    //     }
    //    }

    async checkExistingRole(userId) {
        const result = await this.userRoleMappingRepository.findOne({
            where: { userId },
            relations: ['user']
        })
        return result;
    }

}
