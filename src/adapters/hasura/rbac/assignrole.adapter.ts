import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CreateAssignRoleDto } from "src/rbac/assign-role/dto/create-assign-role.dto";


@Injectable()
export class HasuraAssignRoleService {
  constructor(private httpService: HttpService) {}
  public async createAssignRole(request: any, createAssignRoleDto:CreateAssignRoleDto){};
  public async getassignedRole(request: any, createAssignRoleDto:CreateAssignRoleDto){};
  public async deleteassignedRole(userId){};
}