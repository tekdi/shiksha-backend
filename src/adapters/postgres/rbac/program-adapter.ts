import { HttpStatus, Injectable } from "@nestjs/common";
import { Programs } from "../../../rbac/program/entities/program.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProgramDto } from "../../../rbac/program/dto/program.dto";
import { SuccessResponse } from "src/success-response";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { ProgramSearchDto } from "../../../rbac/program/dto/program-search.dto";

@Injectable()
export class PostgresProgramService {
  constructor(
    @InjectRepository(Programs)
    private programRepository: Repository<Programs>
  ) {}
  public async getProgram(programId: string, request: any) {
    try {
      const programExists = await this.programRepository.findOne({
        where: { programId: programId },
      });
      if (!programExists) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Program not found",
        });
      }
      const [results, totalCount] = await this.programRepository.findAndCount({
        where: { programId },
      });
      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
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

  public async createProgram(request: any, programDto: ProgramDto) {
    try {
      // Convert role name to lowercase
      const lowercaseProgramName = programDto.programName.toLowerCase();
      // Check if role name already exists
      const existingProgram = await this.programRepository.findOne({
        where: { programName: lowercaseProgramName },
      });
      if (existingProgram) {
        return new SuccessResponse({
          statusCode: HttpStatus.FORBIDDEN,
          message: "Program name already exists.",
          data: existingProgram,
        });
      } else {
        const programDtoLowercase = {
          ...programDto,
          programName: lowercaseProgramName,
        };

        const response = await this.programRepository.save(programDtoLowercase);
        return new SuccessResponse({
          statusCode: HttpStatus.CREATED,
          message: "Ok.",
          data: response,
        });
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async updateProgram(
    programId: string,
    request: any,
    programDto: ProgramDto
  ) {
    try {
      const programExists = await this.programRepository.findOne({
        where: { programId: programId },
      });
      if (!programExists) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Program not found",
        });
      }

      const response = await this.programRepository.update(
        { programId: programId },
        programDto
      );

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
        data: {
          rowCount: response.affected,
        },
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async searchProgram(
    tenantid: string,
    request: any,
    programSearchDto: ProgramSearchDto
  ) {
    try {
      let { limit, page, filters } = programSearchDto;

      let offset = 0;
      if (page > 1) {
        offset = parseInt(limit) * (page - 1);
      }

      if (limit.trim() === "") {
        limit = "0";
      }

      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }

      const [results, totalCount] = await this.programRepository.findAndCount({
        where: whereClause,
        skip: offset,
        take: parseInt(limit),
      });

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
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

  public async deleteProgram(programId: string) {
    try {
      let response = await this.programRepository.delete(programId);
      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Program deleted successfully.",
        data: {
          rowCount: response.affected,
        },
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }
}
