import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { Privilege } from 'src/rbac/privilege/entities/privilege.entity';
import { PrivilegeDto } from 'src/rbac/privilege/dto/privilege.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class PostgresPrivilegeService {
    constructor(
        @InjectRepository(Privilege)
        private privilegeRepository: Repository<Privilege>
    ) { }
   
    public async createPrivilege(request: any, privilegeDto: PrivilegeDto) {
        try {

            const label = privilegeDto.privilegeName.split(' ').join('');


            // const privilegeNameLowercase = privilegeDto.privilegeName.toLowerCase();
            

        const result = await this.checkExistingPrivilege(label)

        if (result) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.CONFLICT,
                errorMessage: "Privilege with the same name already exists.",
            });
        }

        // Create new privilege
       const privilege = this.privilegeRepository.create({
            ...privilegeDto,
            privilegeName: privilegeDto.privilegeName,
            label:label
        });        
        const response = await this.privilegeRepository.save(privilege);

        return new SuccessResponse({
            statusCode: HttpStatus.CREATED,
            message: "Privilege created successfully.",
            data: response,
        });
    } catch (e) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: e,
        });
    }
}

async checkExistingPrivilege(label){
    const existingPrivilege = await this.privilegeRepository.findOne({ where: { label:label } });
    return existingPrivilege;
}

public async getPrivilege(privilegeId: string, request: any) {
    
        
    try {

        if (!isUUID(privilegeId)) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.BAD_REQUEST,
                errorMessage: "Please Enter valid PrivilegeId (UUID)",
            });
          }

          const privilege = await this.privilegeRepository.findOne({ where: { privilegeId }} );
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



public async updatePrivilege(privilegeId: string, request: any, privilegeDto: PrivilegeDto) {
    try {
        // Get the privilege using the getPrivilege method
        const existingPrivilegeResponse = await this.getPrivilege(privilegeId, request);

        if (existingPrivilegeResponse instanceof ErrorResponseTypeOrm) {
            return existingPrivilegeResponse;
        }

        // Cast the data property of the SuccessResponse to a Privilege object
        const existingPrivilege: Privilege = existingPrivilegeResponse.data as Privilege;

        const newLabel = privilegeDto.privilegeName.split(' ').join('');
        

        const result = await this.checkExistingPrivilege(newLabel)

        if (result) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.CONFLICT,
                errorMessage: "Privilege with the same name already exists.",
            });
        }
        // Merge the updated data into the existing privilege
        const mergedPrivilege = this.privilegeRepository.merge(existingPrivilege, privilegeDto);

        mergedPrivilege.label = newLabel;
        // Save the updated privilege record
        const updatedPrivilegeRecord = await this.privilegeRepository.save(mergedPrivilege);

        return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: "Privilege updated successfully",
            data: updatedPrivilegeRecord
        });
    } catch (e) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: "Internal server error",
        });
    }
}

public async getAllPrivilege(request){

    try {
        const [result,count] = await this.privilegeRepository.findAndCount();

        return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: "Ok",
            totalCount:count,
            data: result
        });
    } catch (e) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: "Internal server error",
        });
    }
}


    public async deletePrivilege(privilegeId, request){

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

}




