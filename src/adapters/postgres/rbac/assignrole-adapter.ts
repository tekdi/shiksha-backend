import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { CreateAssignRoleDto } from 'src/rbac/assign-role/dto/create-assign-role.dto';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
import { IsAlpha, IsUUID, isUUID } from 'class-validator';

@Injectable()
export class PostgresAssignroleService {
   constructor(
    @InjectRepository(UserRoleMapping)
    private userRoleMappingRepository: Repository<UserRoleMapping>
   ){}
   public async createAssignRole(request: Request,createAssignRoleDto:CreateAssignRoleDto){
    try {
        let findExistingRole = await this.userRoleMappingRepository.findOne({
            where:{
                userId:createAssignRoleDto?.userId,
                roleId:createAssignRoleDto?.roleId
            }
        })
        if(findExistingRole){
            return new SuccessResponse({
                statusCode: HttpStatus.FORBIDDEN,
                message: "Role Already Assigned to This User.",
            });
        }
        let data = await this.userRoleMappingRepository.save(createAssignRoleDto)
        return new SuccessResponse({
            statusCode: HttpStatus.CREATED,
            message: "Ok.",
            data: data,
        });
    } catch (error) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: JSON.stringify(error)
        });
    }
   }

   public async getAssignedRole(userId:string,request: Request){
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

   public async deleteAssignedRole(userId){
    try {
        let result = await this.checkExistingRole(userId);
        if(!result){
            return new SuccessResponse({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'No Role assigned to user',
                data: result,
            });
        }
        let response =  await this.userRoleMappingRepository.delete(userId)
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

   async checkExistingRole(userId){
    const result= await this.userRoleMappingRepository.findOne({
        where: { userId },
        relations:['user']
    })
    return result;
   }

}