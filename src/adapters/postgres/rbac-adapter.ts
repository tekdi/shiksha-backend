import { HttpStatus, Injectable } from '@nestjs/common';
import { Role } from "../../rbac/entities/rbac.entity";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleDto } from "../../rbac/dto/rbac.dto";
import { SuccessResponse } from '../../../src/success-response';
import { ErrorResponseTypeOrm } from '../../../src/error-response-typeorm';
import { RoleSearchDto } from "../../rbac/dto/rbac-search.dto";

@Injectable()
export class PostgresRbacService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>
    ) { }
    public async createRole(request: any, roleDto: RoleDto) {
        try {
            const response = await this.roleRepository.save(roleDto);
            return new SuccessResponse({
                statusCode: HttpStatus.CREATED,
                message: "Ok.",
                data: response,
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }
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
            const response =  await this.roleRepository.update(roleId,roleDto)
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
            let response =  await this.roleRepository.delete(roleId)
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
}


