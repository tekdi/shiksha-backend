import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { CreatePrivilegeRoleDto } from "src/rbac/assign-privilege/dto/create-assign-privilege.dto";


@Injectable()
export class HasuraAssignPrivilegeService {
  constructor(private httpService: HttpService) {}
  public async createPrivilegeRole(request: any, createAssignRoleDto:CreatePrivilegeRoleDto,response : Response){};
  public async getPrivilegeRole(request: any, createAssignRoleDto:CreatePrivilegeRoleDto, response:Response){};
  public async deletePrivilegeRole(userId){};
}