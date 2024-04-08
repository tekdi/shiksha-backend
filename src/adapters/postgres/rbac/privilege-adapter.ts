import { HttpStatus, Injectable } from '@nestjs/common';
import { Role } from "src/rbac/role/entities/rbac.entity"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleDto } from "../../../rbac/role/dto/role.dto";
import { SuccessResponse } from 'src/success-response';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { RoleSearchDto } from "../../../rbac/role/dto/role-search.dto";

@Injectable()
export class PostgresPrivilegeService {
   
}


