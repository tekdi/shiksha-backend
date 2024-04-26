import { ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { Role } from "src/rbac/role/entities/role.entity"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolesDto, RoleDto, RolesResponseDto } from "../../../rbac/role/dto/role.dto";
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { RoleSearchDto } from "../../../rbac/role/dto/role-search.dto";
import { isUUID } from 'class-validator';
import { RolePrivilegeMapping } from 'src/rbac/assign-privilege/entities/assign-privilege.entity';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';

@Injectable()
export class PostgresRoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(RolePrivilegeMapping)
        private rolePrivilegeMappingRepository: Repository<RolePrivilegeMapping>,
        @InjectRepository(UserRoleMapping)
        private userRoleMappingRepository: Repository<UserRoleMapping>
    ) { }
    public async createRole(request: any, createRolesDto: CreateRolesDto) {

        const tenant = await this.checkTenantID(createRolesDto.tenantId)
        if (!tenant) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.BAD_REQUEST,
                errorMessage: "Please enter valid tenantId",
            });
        }
        const roles = [];
        const errors = []
        try {

            // Convert role name to lowercase
            for (const roleDto of createRolesDto.roles) {
                const tenantId = createRolesDto.tenantId;
                const code = roleDto.title.toLowerCase().replace(/\s+/g, '_');

                // Check if role name already exists
                const existingRole = await this.roleRepository.findOne({ where: { code:code,tenantId:tenantId } })
                if (existingRole) {
                    errors.push({
                        errorMessage: `Combination of this tenantId and the code '${code}' already exists.`,
                    });
                    continue;
                }

                const newRoleDto = new RoleDto({
                    ...roleDto,
                    code,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: request.user.userId, // Assuming you have a user object in the request
                    updatedBy: request.user.userId,
                    tenantId, // Add the tenantId to the RoleDto
                });
                // Convert roleDto to lowercase
                // const response = await this.roleRepository.save(roleDto);
                const roleEntity = this.roleRepository.create(newRoleDto);

                // Save the role entity to the database
                const response = await this.roleRepository.save(roleEntity);
                roles.push(new RolesResponseDto(response));
            }
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }

        return {
            statusCode: HttpStatus.OK,
            successCount: roles.length,
            errorCount: errors.length,
            roles,
            errors,
        };
    }

    public async getRole(roleId: string, request: any) {
        try {
            const [results, totalCount] = await this.roleRepository.findAndCount({
                where: { roleId }
            })
            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                totalCount,
                data: results,
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    public async updateRole(roleId: string, request: any, roleDto: RoleDto) {
        try {
            const response = await this.roleRepository.update(roleId, roleDto)
            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: "Ok.",
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

    public async searchRole(tenantid: string, request: any, roleSearchDto: RoleSearchDto) {
        try {

            let { limit, page, filters } = roleSearchDto;

            let offset = 0;
            if (page > 1) {
                offset = parseInt(limit) * (page - 1);
            }

            if (limit.trim() === '') {
                limit = '0';
            }

            const whereClause = {};
            if (filters && Object.keys(filters).length > 0) {
                Object.entries(filters).forEach(([key, value]) => {
                    whereClause[key] = value;
                });
            }

            const [results, totalCount] = await this.roleRepository.findAndCount({
                where: whereClause,
                skip: offset,
                take: parseInt(limit),
            });

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                totalCount,
                data: results,
            });

        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
    }

    public async deleteRole(roleId: string) {
        try {
          if (!isUUID(roleId)) {
            return new ErrorResponseTypeOrm({
              statusCode: HttpStatus.BAD_REQUEST,
              errorMessage: "Please Enter valid (UUID)",
            });
          }
    
          const roleToDelete = await this.roleRepository.findOne({
            where: { roleId: roleId },
          });
    
          if (!roleToDelete) {
            return new ErrorResponseTypeOrm({
              statusCode: HttpStatus.NOT_FOUND,
              errorMessage: "Role  not found",
            });
          }
          // Delete the role
          const response = await this.roleRepository.delete(roleId);
    
          // Delete entries from RolePrivilegesMapping table associated with the roleId
          const rolePrivilegesDeleteResponse =
            await this.rolePrivilegeMappingRepository.delete({
              roleId: roleId,
            });
    
          const userRoleDeleteResponse =
            await this.userRoleMappingRepository.delete({
              roleId: roleId,
            });
    
          return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: "Role deleted successfully.",
            data: {
              rowCount: response.affected,
            },
          });
        } catch (e) {
          return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: "Internal server error", // Access the error message
          });
        }
      }


    public async checkTenantID(tenantId) {
        try {
            let query = `SELECT "tenantId" FROM public."Tenants"
        where "tenantId"= $1 `
            let response = await this.roleRepository.query(query, [tenantId]);
            if (response.length > 0) {
                return true
            }
        }
        catch (error) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });

        }
    }
}


