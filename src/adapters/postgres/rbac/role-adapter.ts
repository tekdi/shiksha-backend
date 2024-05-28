import { ConsoleLogger, HttpStatus, Injectable } from "@nestjs/common";
import { Role } from "src/rbac/role/entities/role.entity";
import { RolePrivilegeMapping } from "src/rbac/assign-privilege/entities/assign-privilege.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  CreateRolesDto,
  RoleDto,
  RolesResponseDto,
} from "../../../rbac/role/dto/role.dto";
import { SuccessResponse } from "src/success-response";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { RoleSearchDto } from "../../../rbac/role/dto/role-search.dto";
import { UserRoleMapping } from "src/rbac/assign-role/entities/assign-role.entity";
import { Privilege } from "src/rbac/privilege/entities/privilege.entity";
import { isUUID } from "class-validator";
import APIResponse from "src/common/responses/response";
import { Response } from 'express';

@Injectable()
export class PostgresRoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRoleMapping)
    private readonly userRoleMappingRepository: Repository<UserRoleMapping>,
    @InjectRepository(RolePrivilegeMapping)
    private readonly roleprivilegeMappingRepository: Repository<RolePrivilegeMapping>
  ) { }
  public async createRole(request: any, createRolesDto: CreateRolesDto, response: Response) {
    const apiId = 'api.create.role'
    const tenant = await this.checkTenantID(createRolesDto.tenantId)
    if (!tenant) {
      APIResponse.error(
        response,
        apiId,
        `Please enter valid tenantId`,
        'Invalid Tenant Id',
        String(HttpStatus.BAD_REQUEST)
      )
    }
    const roles = [];
    const errors = []
    try {

      // Convert role name to lowercase
      for (const roleDto of createRolesDto.roles) {
        const tenantId = createRolesDto.tenantId;
        const code = roleDto.title.toLowerCase().replace(/\s+/g, '_');

        // Check if role name already exists
        const existingRole = await this.roleRepository.findOne({ where: { code: code, tenantId: tenantId } })
        if (existingRole) {
          errors.push({
            errorMessage: `Combination of this tenantId and the code '${code}' already exists.`,
          });
          continue;
        }

        const newRoleDto = new RoleDto({
          ...roleDto,
          code,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: request.user.userId, // Assuming you have a user object in the request
          updatedBy: request.user.userId,
          tenantId, // Add the tenantId to the RoleDto
        });
        // Convert roleDto to lowercase
        // const response = await this.roleRepository.save(roleDto);
        const roleEntity = this.roleRepository.create(newRoleDto);

        // Save the role entity to the database
        const response = await this.roleRepository.save(roleEntity);
        roles.push(new RolesResponseDto(response));
      }
    } catch (e) {
      APIResponse.error(response, apiId, "Internal Server Error", `Error is ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
    }
    APIResponse.success(response, apiId, { successCount: roles.length, errorCount: errors.length, roles, errors },
      String(HttpStatus.OK), 'Role successfully Created')
  }

  public async getRole(roleId: string, request: any, response: Response) {
    const apiId = 'api.get.role';
    try {
      const [roles, totalCount] = await this.roleRepository.findAndCount({
        where: { roleId },
      });
      APIResponse.success(response, apiId, { roles, totalCount }, String(HttpStatus.OK), 'Roles fetched successfully')
    } catch (e) {
      APIResponse.error(response, apiId, "Internal Server Error", `Error is ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async updateRole(roleId: string, request: any, roleDto: RoleDto, response: Response) {
    const apiId = 'api.update.role';
    try {

      const code = roleDto.title.toLowerCase().replace(/\s+/g, '_');
      roleDto.code = code;
      const result = await this.roleRepository.update(roleId, roleDto);
      APIResponse.success(response, apiId, { rowCount: result.affected, }, String(HttpStatus.OK), 'Roles Updated successful')
    } catch (e) {
      APIResponse.error(response, apiId, "Internal Server Error", `Error is ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async searchRole(roleSearchDto: RoleSearchDto, response: Response) {
    const apiId = 'api.search.Role';
    try {
      let { limit, page, filters } = roleSearchDto;

      let offset = 0;
      if (page > 1) {
        offset = parseInt(limit) * (page - 1);
      }

      if (limit.trim() === "") {
        limit = "0";
      }

      let whereClause: any = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }
      if (whereClause.userId && !whereClause.tenantId) {
        APIResponse.error(
          response,
          apiId,
          `Please Enter Tenenat id or Valid Filter`,
          'Invalid Tenant Id or Valid Filter',
          String(HttpStatus.BAD_REQUEST)
        )
      }
      if (whereClause.field && !["Privilege"].includes(whereClause?.field)) {
        APIResponse.error(
          response,
          apiId,
          `Please Enter valid field value.`,
          'Invalid field value.',
          String(HttpStatus.BAD_REQUEST)
        )
      }
      if (whereClause.userId && whereClause.tenantId && whereClause.field === "Privilege") {
        const userRoleMappingData = await this.findUserRoleData(whereClause.userId, whereClause.tenantId);
        const roleIds = userRoleMappingData.map(data => data.roleid);

        const result = await this.findPrivilegeByRoleId(roleIds);

        const roles = userRoleMappingData.map(data => {
          const roleResult = result.find(privilegeData => privilegeData.roleid === data.roleid);
          return {
            roleId: data.roleid,
            title: data.title,
            code: data.code,
            privileges: roleResult ? roleResult : []
          };
        });
        APIResponse.success(response, apiId, roles, String(HttpStatus.OK), 'Role For User with Privileges fetched successfully.')
      } else if (whereClause.userId && whereClause.tenantId && !whereClause.field) {
        const data = await this.findUserRoleData(whereClause.userId, whereClause.tenantId)
        APIResponse.success(response, apiId, data, String(HttpStatus.OK), 'Role For User Id fetched successfully.')
      }
      else if (whereClause.tenantId && whereClause.field === "Privilege") {
        const userRoleData = await this.findRoleData(whereClause.tenantId);
        const result = await this.findPrivilegeByRoleId(userRoleData.map(data => data.roleId));
        const roles = userRoleData.map(data => {
          const roleResult = result.find(privilegeData => privilegeData.roleid === data.roleId);
          return {
            roleId: data.roleId,
            title: data.title,
            code: data.code,
            privileges: roleResult ? roleResult : []
          };
        });
        APIResponse.success(response, apiId, roles, String(HttpStatus.OK), 'Role For Tenant with Privileges fetched successfully.')
      } else if (whereClause.tenantId && !whereClause.field) {
        const data = await this.findRoleData(whereClause.tenantId);
        APIResponse.success(response, apiId, data, String(HttpStatus.OK), 'Role For Tenant fetched successfully.')
      } else {
        APIResponse.error(
          response,
          apiId,
          `Please Enter Valid Filter`,
          'Invalid Filter',
          String(HttpStatus.BAD_REQUEST)
        )
      }
    } catch (e) {
      APIResponse.error(response, apiId, "Internal Server Error", `Error is ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  public async deleteRole(roleId: string, res: Response) {
    const apiId = 'api.delete.role';
    try {
      if (!isUUID(roleId)) {
        APIResponse.error(
          res,
          apiId,
          `Please Enter valid (UUID)`,
          'Invalid UUID',
          String(HttpStatus.BAD_REQUEST)
        )
      }

      const roleToDelete = await this.roleRepository.findOne({
        where: { roleId: roleId },
      });

      if (!roleToDelete) {
        APIResponse.error(
          res,
          apiId,
          `Role not found`,
          'Not found',
          String(HttpStatus.NOT_FOUND)
        )
      }
      // Delete the role
      const response = await this.roleRepository.delete(roleId);

      // Delete entries from RolePrivilegesMapping table associated with the roleId
      const rolePrivilegesDeleteResponse =
        await this.roleprivilegeMappingRepository.delete({
          roleId: roleId,
        });

      const userRoleDeleteResponse =
        await this.userRoleMappingRepository.delete({
          roleId: roleId,
        });
      APIResponse.success(res, apiId, { rowCount: response.affected }, String(HttpStatus.OK), 'Role deleted successfully.')
    } catch (e) {
      APIResponse.error(res, apiId, "Internal Server Error", `Error is ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }


  public async findRoleData(id: string) {
    const data = await this.roleRepository.find({
      where: {
        tenantId: id,
      },
      select: ["roleId", "title", "code"],
    });
    return data;
  }

  public async findUserRoleData(userId: string, tenantId: string) {
    let userRoleData = await this.userRoleMappingRepository.createQueryBuilder('urp').
      innerJoin(Role, 'r', 'r.roleId=urp.roleId').
      select(['urp.roleId as roleid', 'r.title as title', 'r.code as code']).
      where("urp.userId= :userId", { userId }).
      andWhere("urp.tenantId=:tenantId", { tenantId })
      .getRawMany()
    return userRoleData;
  }

  public async findPrivilegeByRoleId(roleIds: string[]) {
    const privileges = await this.roleprivilegeMappingRepository
      .createQueryBuilder("rpm")
      .innerJoin(Privilege, "p", "p.privilegeId=rpm.privilegeId")
      .select([
        "p.privilegeId as privilegeId",
        "p.name as name",
        "p.code as code",
        "rpm.roleId as roleId"
      ])
      .where("rpm.roleId IN (:...roleIds)", { roleIds })
      .getRawMany();
    return privileges;
  }

  public async checkTenantID(tenantId) {
    try {
      let query = `SELECT "tenantId" FROM public."Tenants"
        where "tenantId"= $1 `;
      let response = await this.roleRepository.query(query, [tenantId]);
      if (response.length > 0) {
        return true;
      }
    } catch (error) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: error,
      });
    }

  }
}
