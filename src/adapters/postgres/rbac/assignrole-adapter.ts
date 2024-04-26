import { BadRequestException, ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { CreateAssignRoleDto } from 'src/rbac/assign-role/dto/create-assign-role.dto';
import { UserRoleMapping } from 'src/rbac/assign-role/entities/assign-role.entity';
import { IsAlpha, IsUUID, isUUID } from 'class-validator';
import { executionAsyncResource } from 'async_hooks';
import { DeleteAssignRoleDto } from 'src/rbac/assign-role/dto/delete-assign-role.dto';

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
        if(error.code === '23503'){
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

   public async deleteAssignedRole(deleteAssignRoleDto: DeleteAssignRoleDto) {
    try {
      // Validate userId format
      if (!isUUID(deleteAssignRoleDto.userId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Invalid userId format. Please provide a valid UUID.",
        });
      }
      // Validate roleId format
      for (const roleId of deleteAssignRoleDto.roleId) {
        if (!isUUID(roleId)) {
          return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.BAD_REQUEST,
            errorMessage: "Invalid roleId format. Please provide valid UUIDs.",
          });
        }
      }
      // Check if the userId exists in userRoleMapping table
      const userExists = await this.userRoleMappingRepository.findOne({
        where: { userId: deleteAssignRoleDto.userId },
      });
      if (!userExists) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "User not found in userRoleMapping table",
        });
      }
      // Check if all roleId(s) exist
      const roleExists = await this.userRoleMappingRepository.find({
        where: {
          userId: deleteAssignRoleDto.userId,
          roleId: In(deleteAssignRoleDto.roleId),
        },
      });
      // If any roleId(s) are missing, throw an error
      if (roleExists.length !== deleteAssignRoleDto.roleId.length) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Roles not found for the user",
        });
      }
      // If all validations pass, proceed with deletion
      const response = await this.userRoleMappingRepository.delete({
        userId: deleteAssignRoleDto.userId,
        roleId: In(deleteAssignRoleDto.roleId),
      });
      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Roles deleted successfully.",
        data: {
          rowCount: response.affected,
        },
      });
    } catch (e) {
      console.error(e);
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e.message || "Internal server error",
      });
    }
  }

//    async checkAndAddUserRole(data){
//     let existingUser = await this.checkExistingRole(data.userId) ;
//     if(existingUser){
//         let update  = 
//     }
//    }

   async checkExistingRole(userId){
   const result= await this.userRoleMappingRepository.findOne({
        where: { userId },
        relations:['user']
    })
    return result;
   }

}