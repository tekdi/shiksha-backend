import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CreateRolesDto, RoleDto } from "../../../rbac/role/dto/role.dto";
import { RoleSearchDto } from "../../../rbac/role/dto/role-search.dto";

@Injectable()
export class HasuraRoleService {
  constructor(private httpService: HttpService) {}
  public async getRole(roleId: string, request: any) {}
  public async createRole(request: any, createRolesDto: CreateRolesDto){}
  public async deleteRole(roleId: string) {}
  public async updateRole(roleId: string, request: any, roleDto: RoleDto) {}
  public async searchRole(tenantid: string, request: any, roleSearchDto: RoleSearchDto) {}
}
