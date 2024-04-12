import { ProgramsRoleMappingDto } from './../../../rbac/programs-role-mapping/dto/programs-role-mapping.dto';
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";


@Injectable()
export class HasuraProgramsRoleMappingService {
  constructor(private httpService: HttpService) {}

  public async createProgramsRoleMapping(request: any, programsRoleMappingDto: ProgramsRoleMappingDto) {}

  public async getProgramRoleMapping(Id, request){}

  public async getAllProgramRoleMapping(request){}

  public async deleteProgramRoleMapping(Id, request){}

  public async updateProgramsRoleMapping(Id, request, programsRoleMappingDto:ProgramsRoleMappingDto){}

}