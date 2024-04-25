import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import {
  CreatePrivilegesDto,
  PrivilegeDto,
} from "src/rbac/privilege/dto/privilege.dto";

@Injectable()
export class HasuraPrivilegeService {
  constructor(private httpService: HttpService) {}

  public async createPrivilege(
    loggedinUser: any,
    createPrivileges: CreatePrivilegesDto
  ) {}
  public async getPrivilege(roleId: string, request: any) {}
  // public async updatePrivilege(privilegeId, request, privilegeDto){}
  public async getAllPrivilege(request) {}
  public async deletePrivilege(privilegeId) {}
}
