import { HttpStatus, Injectable } from "@nestjs/common";
import { Programs } from "../../../rbac/program/entities/program.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProgramDto } from "../../../rbac/program/dto/program.dto";
import { SuccessResponse } from "src/success-response";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { ProgramSearchDto } from "../../../rbac/program/dto/program-search.dto";

@Injectable()
export class HasuraProgramService {
  constructor(
    @InjectRepository(Programs)
    private programRepository: Repository<Programs>
  ) {}
  public async getProgram(programId: string, request: any) {}
  public async createProgram(request: any, programDto: ProgramDto) {}
  public async updateProgram(
    programId: string,
    request: any,
    programDto: ProgramDto
  ) {}
  public async searchProgram(
    tenantid: string,
    request: any,
    programSearchDto: ProgramSearchDto
  ) {}
  public async deleteProgram(programId: string) {}
}
