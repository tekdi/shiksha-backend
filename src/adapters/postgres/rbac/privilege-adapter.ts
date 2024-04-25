import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SuccessResponse } from "src/success-response";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { Privilege } from "src/rbac/privilege/entities/privilege.entity";
import {
  CreatePrivilegesDto,
  PrivilegeDto,
  PrivilegeResponseDto,
} from "src/rbac/privilege/dto/privilege.dto";
import { isUUID } from "class-validator";
import { RolePrivilegeMapping } from "src/rbac/assign-privilege/entities/assign-privilege.entity";

@Injectable()
export class PostgresPrivilegeService {
  constructor(
    @InjectRepository(Privilege)
    private privilegeRepository: Repository<Privilege>,
    @InjectRepository(RolePrivilegeMapping)
    private rolePrivilegeMappingRepository: Repository<RolePrivilegeMapping>
  ) {}

  public async createPrivilege(
    loggedinUser: any,
    createPrivilegesDto: CreatePrivilegesDto
  ) {
    const privileges = [];
    const errors = [];
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

        privilegeDto.createdBy = loggedinUser;
        privilegeDto.updatedBy = loggedinUser;

        // Create new privilege
        const privilege = this.privilegeRepository.create(privilegeDto);
        const response = await this.privilegeRepository.save(privilege);
        privileges.push(new PrivilegeResponseDto(response));
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e.message || "Internal server error",
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
      const existingPrivilege = await this.privilegeRepository.findOne({
        where: { code },
      });
      return existingPrivilege;
    } catch (error) {
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

      const privilege = await this.privilegeRepository.findOne({
        where: { privilegeId },
      });
      if (!privilege) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Privilege not found",
        });
      }

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
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
        data: result,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: "Internal server error",
      });
    }
  }

  public async deletePrivilege(privilegeId: string) {
    try {
      if (!isUUID(privilegeId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter valid (UUID)",
        });
      }

      const privilegeToDelete = await this.privilegeRepository.findOne({
        where: { privilegeId: privilegeId },
      });
      if (!privilegeToDelete) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Privilege not found",
        });
      }
      // Delete the privilege
      const response = await this.privilegeRepository.delete(privilegeId);

      // Delete entries from RolePrivilegesMapping table associated with the privilegeId
      const rolePrivilegesDeleteResponse =
        await this.rolePrivilegeMappingRepository.delete({
          privilegeId: privilegeId,
        });

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Privilege deleted successfully.",
        data: {
          rowCount: response.affected,
        },
      });
    } catch (e) {
      console.log(e);
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: "Internal server error",
      });
    }
  }
}
