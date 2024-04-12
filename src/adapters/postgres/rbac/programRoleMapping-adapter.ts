import { ProgramsRoleMappingDto } from './../../../rbac/programs-role-mapping/dto/programs-role-mapping.dto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { isUUID } from 'class-validator';
import { ProgramsRoleMapping } from 'src/rbac/programs-role-mapping/entities/programs-role-mapping.entity';

@Injectable()
export class PostgresProgramsRoleMappingService {
    constructor(
        @InjectRepository(ProgramsRoleMapping)
        private programsRoleMappingRepository: Repository<ProgramsRoleMapping>
    ) { }
   
    public async createProgramsRoleMapping(request: any, programsRoleMappingDto: ProgramsRoleMappingDto) {
       
        try {
            let findExistingProgramRoleMapping = await this.checkExistingProgramRoleMapping(programsRoleMappingDto.programId,programsRoleMappingDto.roleId)
          
            if(findExistingProgramRoleMapping){
                return new SuccessResponse({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: "This combination of programId and roleId already exists.",
                });
            }
            let data = await this.programsRoleMappingRepository.save(programsRoleMappingDto)
            return new SuccessResponse({
                statusCode: HttpStatus.CREATED,
                message: "Ok.",
                data: data,
            });
        } catch (error) {
            if (error.code == '23503') {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Please provide valid roleId and programId",
                });
            }
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: JSON.stringify(error)
            });
        }
    }



async checkExistingProgramRoleMapping(programId,roleId){
    const existingProgramRoleMapping = await this.programsRoleMappingRepository.findOne({ where: { programId:programId,roleId:roleId } });
    return existingProgramRoleMapping;
}

public async getProgramRoleMapping(Id, request) {
    
        
    try {

        if (!isUUID(Id)) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.BAD_REQUEST,
                errorMessage: "Please Enter valid mappingId (UUID)",
            });
          }

          const ProgramsRoleMapping = await this.programsRoleMappingRepository.findOne({ where: { Id }} );
        if (!ProgramsRoleMapping) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.NOT_FOUND,
                errorMessage: "ProgramRoleMapping not found",
            });
        }

        return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: 'Ok.',
            data: ProgramsRoleMapping,
        });
    } catch (e) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: e,
        });
    }

}



public async getAllProgramRoleMapping(request){

    try {
        const [result,count] = await this.programsRoleMappingRepository.findAndCount();

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

public async deleteProgramRoleMapping(Id, request){

    try {

        const existingProgramsRoleMapping = await this.getProgramRoleMapping(Id, request);

        if (existingProgramsRoleMapping instanceof ErrorResponseTypeOrm) {
            return existingProgramsRoleMapping;
        }
        const result = await this.programsRoleMappingRepository.delete(Id);

        return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: "ProgramRoleMapping Deleted successfully",
            data: {
                affectedRows: result 
            }
        });
    } catch (e) {
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: "Internal server error",
        });
    }
}


public async updateProgramsRoleMapping(Id: string, request: any, programsRoleMappingDto: ProgramsRoleMappingDto) {
    try {
        const existingProgramRoleMappingResponse = await this.getProgramRoleMapping(Id, request);

        if (existingProgramRoleMappingResponse instanceof ErrorResponseTypeOrm) {
            return existingProgramRoleMappingResponse;
        }

        const existingProgramRoleMapping: ProgramsRoleMapping = existingProgramRoleMappingResponse.data as ProgramsRoleMapping;

        const mergedProgramsRoleMapping = this.programsRoleMappingRepository.merge(existingProgramRoleMapping, programsRoleMappingDto);

        const updatedPrivilegeRecord = await this.programsRoleMappingRepository.save(mergedProgramsRoleMapping);

        return new SuccessResponse({
            statusCode: HttpStatus.OK,
            message: "Privilege updated successfully",
            data: updatedPrivilegeRecord
        });
    } catch (error) {
        if (error.code == '23503') {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.BAD_REQUEST,
                errorMessage: "Please provide valid roleId and programId",
            });
        }
        return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: JSON.stringify(error)
        });
    }
}

}








