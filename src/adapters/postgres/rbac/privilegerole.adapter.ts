import {HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { CreatePrivilegeRoleDto } from 'src/rbac/assign-privilege/dto/create-assign-privilege.dto';
import { RolePrivilegeMapping } from 'src/rbac/assign-privilege/entities/assign-privilege.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class PostgresAssignPrivilegeService {
   constructor(
    @InjectRepository(RolePrivilegeMapping)
    private rolePrivilegeMappingRepository: Repository<RolePrivilegeMapping>
   ){}
   public async createPrivilegeRole(request: Request,createPrivilegeRoleDto:CreatePrivilegeRoleDto){
    try {
        let result ;
        if (createPrivilegeRoleDto.deleteOld) {
            await this.deleteByRoleId(createPrivilegeRoleDto.roleId);
        }
        const privilegeRoles = createPrivilegeRoleDto.privilegeId.map(privilegeId => ({
            roleId: createPrivilegeRoleDto.roleId,
            privilegeId
        }));
        const existingPrivileges = await this.rolePrivilegeMappingRepository.find({
            where: {
                roleId: createPrivilegeRoleDto.roleId,
                privilegeId: In(createPrivilegeRoleDto.privilegeId)
            }
        });

        const newPrivileges = privilegeRoles.filter(privilegeRole => {
            return !existingPrivileges.some(existing => existing.privilegeId === privilegeRole.privilegeId);
        });

        for (let data of newPrivileges) {
            result = await this.rolePrivilegeMappingRepository.save(data);
        }
        return new SuccessResponse({
            statusCode: HttpStatus.CREATED,
            message: "Privileges assigned successfully.",
            data: result,
        });
    } catch (error) {
        if(error.code === '23503'){
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.NOT_FOUND,
                errorMessage: `Privilege Id or Role Id Doesn't Exist in Database `
            }); 
        }
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: JSON.stringify(error)
        });
    }
   }

   public async deleteByRoleId(roleId: string) {
    try {
        await this.rolePrivilegeMappingRepository.delete({ roleId });
    } catch (error) {
        throw error;
    }
}
//    public async createPrivilegeRole(){

//    }
   public async getPrivilegeRole(userId:string,request: Request){
    try {
        if (!isUUID(userId)) {
            return new SuccessResponse({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Please Enter Valid User ID',
            });
          }
        let result = await this.checkExistingRole(userId);
        if(!result){
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

   async checkExistingRole(privilegeId){
    const result= await this.rolePrivilegeMappingRepository.findOne({
        where: { privilegeId},
        relations:['user']
    })
    return result;
   }

}
