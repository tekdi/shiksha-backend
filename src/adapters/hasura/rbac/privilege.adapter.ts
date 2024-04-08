import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { RoleDto } from "../../../rbac/role/dto/role.dto";
import { RoleSearchDto } from "../../../rbac/role/dto/role-search.dto";

@Injectable()
export class HasuraPrivilegeService {
  constructor(private httpService: HttpService) {}
 
}
