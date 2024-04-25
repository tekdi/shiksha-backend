import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { Privilege } from 'src/rbac/privilege/entities/privilege.entity';
import { CreatePrivilegesDto, PrivilegeDto, PrivilegeResponseDto } from 'src/rbac/privilege/dto/privilege.dto';
import { isUUID } from 'class-validator';
import { Role } from 'src/rbac/role/entities/role.entity';

@Injectable()
export class PostgresPrivilegeService {
    constructor(
        @InjectRepository(Privilege)
        private privilegeRepository: Repository<Privilege>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>

    ) { }

    public async createPrivilege(loggedinUser: any, createPrivilegesDto: CreatePrivilegesDto) {

        const privileges = [];
        const errors = []
        try {

            for (const privilegeDto of createPrivilegesDto.privileges) {
                const code = privilegeDto.code;

                // Check if privilege with the same label already exists
                const existingPrivilege = await this.checkExistingPrivilege(code);

                if (existingPrivilege) {
                    errors.push({
                        errorMessage: `Privilege with the code '${privilegeDto.code}' already exists.`,
                    });
                    continue; // Skip to the next privilege
                }

                privilegeDto.createdBy = loggedinUser
                privilegeDto.updatedBy = loggedinUser


                // Create new privilege
                const privilege = this.privilegeRepository.create(privilegeDto);
                const response = await this.privilegeRepository.save(privilege);
                privileges.push(new PrivilegeResponseDto(response));
            }

        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e.message || 'Internal server error',
            });
        }

        return {
            statusCode: HttpStatus.OK,
            successCount: privileges.length,
            errorCount: errors.length,
            privileges,
            errors,
        };
    }

    public async checkExistingPrivilege(code) {
        try {
            const existingPrivilege = await this.privilegeRepository.findOne({ where: { code } });
            return existingPrivilege;
        }
        catch (error) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });
        }
    }

    public async getPrivilege(privilegeId: string, request: any) {

        try {

            if (!isUUID(privilegeId)) {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Please Enter valid PrivilegeId (UUID)",
                });
            }

            const privilege = await this.privilegeRepository.findOne({ where: { privilegeId } });
            if (!privilege) {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.NOT_FOUND,
                    errorMessage: "Privilege not found",
                });
            }

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                // totalCount,
                data: privilege,
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }

    }



    // public async updatePrivilege(privilegeId: string, request: any, privilegeDto: PrivilegeDto) {
    //     try {
    //         // Get the privilege using the getPrivilege method
    //         const existingPrivilegeResponse = await this.getPrivilege(privilegeId, request);

    //         if (existingPrivilegeResponse instanceof ErrorResponseTypeOrm) {
    //             return existingPrivilegeResponse;
    //         }

    //         // Cast the data property of the SuccessResponse to a Privilege object
    //         const existingPrivilege: Privilege = existingPrivilegeResponse.data as Privilege;

    //         const newLabel = privilegeDto.privilegeName.split(' ').join('');


    //         const result = await this.checkExistingPrivilege(newLabel)

    //         if (result) {
    //             return new ErrorResponseTypeOrm({
    //                 statusCode: HttpStatus.CONFLICT,
    //                 errorMessage: "Privilege with the same name already exists.",
    //             });
    //         }
    //         // Merge the updated data into the existing privilege
    //         const mergedPrivilege = this.privilegeRepository.merge(existingPrivilege, privilegeDto);

    //         mergedPrivilege.label = newLabel;
    //         // Save the updated privilege record
    //         const updatedPrivilegeRecord = await this.privilegeRepository.save(mergedPrivilege);

    //         return new SuccessResponse({
    //             statusCode: HttpStatus.OK,
    //             message: "Privilege updated successfully",
    //             data: updatedPrivilegeRecord
    //         });
    //     } catch (e) {
    //         return new ErrorResponseTypeOrm({
    //             statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    //             errorMessage: "Internal server error",
    //         });
    //     }
    // }

    public async getAllPrivilege(request) {

        try {
            const [result, count] = await this.privilegeRepository.findAndCount();

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: "Ok",
                totalCount: count,
                data: result
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: "Internal server error",
            });
        }
    }


    public async deletePrivilege(privilegeId, request) {

        try {

            const existingPrivilegeResponse = await this.getPrivilege(privilegeId, request);

            if (existingPrivilegeResponse instanceof ErrorResponseTypeOrm) {
                return existingPrivilegeResponse;
            }
            const result = await this.privilegeRepository.delete(privilegeId);

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: "Privilege Deleted successfully",
                data: {
                    affectedRows: result // Return the number of affected rows
                }
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: "Internal server error",
            });
        }
    }

    public async getPrivilegebyRoleId(tenantId, roleId, request) {

        if (!isUUID(tenantId) || !isUUID(roleId)) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.BAD_REQUEST,
                errorMessage: "Please Enter valid tenantId and roleId (UUID)",
            });
        }

        try {
            const valid = await this.checkValidTenantIdRoleIdCombination(tenantId, roleId)

            if (!valid) {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Invalid combination of roleId and tenantId",
                });
            }

            let query = `SELECT r.*, u.*
        FROM public."RolePrivilegesMapping" AS r
        inner JOIN public."Privileges" AS u ON r."privilegeId" = u."privilegeId"
        where r."roleId"=$1`

            const result = await this.privilegeRepository.query(query, [roleId]);
            const privilegeResponseArray: PrivilegeResponseDto[] = result.map((item: any) => {
                const privilegeDto = new PrivilegeDto(item);
                privilegeDto.title = item.name
                return new PrivilegeResponseDto(privilegeDto);
            });

            if (!privilegeResponseArray.length) {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.NOT_FOUND,
                    errorMessage: "No privileges assigned to the role",
                });
            }

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: "Ok",
                data: privilegeResponseArray
            });
        }
        catch (error) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });
        }


    }

    public async checkValidTenantIdRoleIdCombination(tenantId, roleId) {
        try {

            const ValidTenantIdRoleCombination = await this.roleRepository.findOne({ where: { tenantId: tenantId, roleId: roleId } });
            return ValidTenantIdRoleCombination;
        }
        catch (error) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });
        }
    }

}




