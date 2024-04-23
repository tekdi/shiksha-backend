import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { PrivilegeDto } from "src/rbac/privilege/dto/privilege.dto";


@Injectable()
export class HasuraPrivilegeService {
  constructor(private httpService: HttpService) {}

  public async createPrivilege(request: any, privilegeDto: PrivilegeDto) {}
  public async getPrivilege(roleId: string, request: any) {}
  public async updatePrivilege(privilegeId, request, privilegeDto){}
  public async getAllPrivilege(request){}
  public async deletePrivilege(privilegeId, request){}

}
