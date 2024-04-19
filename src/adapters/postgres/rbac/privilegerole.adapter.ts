import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        let findExistingPrivilege = await this.rolePrivilegeMappingRepository.findOne({
            where:{
                privilegeId:createPrivilegeRoleDto?.privilegeId,
                roleId:createPrivilegeRoleDto?.roleId
            }
        })
        if(findExistingPrivilege){
            return new SuccessResponse({
                statusCode: HttpStatus.FORBIDDEN,
                message: "Privilege Already Assigned to This Role.",
            });
        }
        let data = await this.rolePrivilegeMappingRepository.save(createPrivilegeRoleDto)
        return new SuccessResponse({
            statusCode: HttpStatus.CREATED,
            message: "Ok.",
            data: data,
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

   public async deletePrivilegeRole(userId){
    try {
        let result = await this.checkExistingRole(userId);
        if(!result){
            return new SuccessResponse({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'No Role assigned to user',
                data: result,
            });
        }
        let response =  await this.rolePrivilegeMappingRepository.delete(userId)
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

   async checkExistingRole(privilegeId){
    const result= await this.rolePrivilegeMappingRepository.findOne({
        where: { privilegeId},
        relations:['user']
    })
    return result;
   }

}
