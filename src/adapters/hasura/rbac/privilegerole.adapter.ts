import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CreatePrivilegeRoleDto } from "src/rbac/assign-privilege/dto/create-assign-privilege.dto";


@Injectable()
export class HasuraAssignPrivilegeService {
  constructor(private httpService: HttpService) {}
  public async createPrivilegeRole(request: any, createAssignRoleDto:CreatePrivilegeRoleDto){};
  public async getPrivilegeRole(request: any, createAssignRoleDto:CreatePrivilegeRoleDto){};
  public async deletePrivilegeRole(userId){};
}