import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembers } from "src/cohortMembers/entities/cohort-member.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { CohortDto } from "src/cohort/dto/cohort.dto";

import { HttpStatus } from "@nestjs/common";
import response from "src/utils/response";
import { User } from "src/user/entities/user-entity";
import { CohortMembersUpdateDto } from "src/cohortMembers/dto/cohortMember-update.dto";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { Fields } from "src/fields/entities/fields.entity";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { isUUID } from "class-validator";
import { Cohort } from "src/cohort/entities/cohort.entity";
import APIResponse from "src/common/responses/response";
import { Response } from "express";
import { APIID } from 'src/common/utils/api-id.config';
import { Role } from "src/rbac/role/entities/role.entity";
@Injectable()
export class PostgresCohortMembersService {
  constructor(
    @InjectRepository(CohortMembers)
    private cohortMembersRepository: Repository<CohortMembers>,
    @InjectRepository(Fields)
    private fieldsRepository: Repository<Fields>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) { }

  async getCohortMembers(cohortId: any, tenantId: any, fieldvalue: any, res: Response) {
    const apiId = APIID.COHORT_MEMBER_GET
    try {
      const fieldvalues = fieldvalue?.toLowerCase()

      if (!tenantId) {
        return APIResponse.error(res, apiId, "Bad Request", `TenantId required`, HttpStatus.BAD_REQUEST);
      }

      if (!isUUID(cohortId)) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: CohortId must be a valid UUID.", HttpStatus.BAD_REQUEST);
      }


      const cohortTenantMap = await this.cohortRepository.find({
        where: {
          cohortId: cohortId,
          tenantId: tenantId
        }
      })
      if (!cohortTenantMap) {
        return APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort not found for the provided tenant.", HttpStatus.NOT_FOUND);
      }
      const userDetails = await this.findcohortData(cohortId);
      if (userDetails === true) {
        let results = {
          userDetails: [],
        };

        let cohortDetails = await this.getUserDetails(
          cohortId,
          "cohortId",
          fieldvalues
        );
        results.userDetails.push(cohortDetails);

        return APIResponse.success(res, apiId, results, HttpStatus.OK, "Cohort members details fetched successfully.");
      } else {
        return APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort Member not exist.", HttpStatus.NOT_FOUND);
      }
    } catch (e) {
      const errorMessage = e.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getUserDetails(searchId: any, searchKey: any, fieldShowHide: any) {
    let results = {
      userDetails: [],
    };

    let getUserDetails = await this.findUserName(searchId, searchKey);

    for (let data of getUserDetails) {
      let userDetails = {
        userId: data?.userId,
        userName: data?.userName,
        name: data?.name,
        role: data?.role,
        district: data?.district,
        state: data?.state,
        mobile: data?.mobile
      };

      if (fieldShowHide === "true") {
        const fieldValues = await this.getFieldandFieldValues(data.userId);
        userDetails['customField'] = fieldValues;
        results.userDetails.push(userDetails);
      } else {
        results.userDetails.push(userDetails);
      }
    }

    return results;
  }
  async findFilledValues(userId: string) {
    let query = `SELECT U."userId",F."fieldId",F."value" FROM public."Users" U
    LEFT JOIN public."FieldValues" F
    ON U."userId" = F."itemId" where U."userId" =$1`;
    let result = await this.usersRepository.query(query, [userId]);
    return result;
  }
  async findcohortData(cohortId: any) {
    let whereClause: any = { cohortId: cohortId };
    let userDetails = await this.cohortMembersRepository.find({
      where: whereClause,
    });
    if (userDetails.length !== 0) {
      return true;
    } else {
      return false;
    }
  }
  async findCustomFields(role) {
    let customFields = await this.fieldsRepository.find({
      where: {
        context: "USERS",
        contextType: role.toUpperCase(),
      },
    });
    return customFields;
  }

  async getFieldandFieldValues(userId: string) {
    let query = `SELECT Fv."fieldId",F."label" AS FieldName,Fv."value" as FieldValues
    FROM public."FieldValues" Fv
    LEFT JOIN public."Fields" F
    ON F."fieldId" = Fv."fieldId"
    where Fv."itemId" =$1 `;
    let result = await this.usersRepository.query(query, [userId]);
    return result;
  }

  async findUserName(searchData: string, searchKey: any) {
    let whereCase;
    if (searchKey == "cohortId") {
      whereCase = `where CM."cohortId" =$1`;
    } else {
      whereCase = `where CM."userId" =$1`;
    }
    let query = `SELECT U."userId", U.username, U.name, U.district, U.state,U.mobile FROM public."CohortMembers" CM
    LEFT JOIN public."Users" U
    ON CM."userId" = U."userId" ${whereCase}`;

    let result = await this.usersRepository.query(query, [searchData]);
    return result;
  }

  public async searchCohortMembers(
    cohortMembersSearchDto: CohortMembersSearchDto,
    fieldvalue: string,
    tenantId: string,
    res: Response
  ) {
    const apiId = APIID.COHORT_MEMBER_SEARCH;
    try {
      if (!isUUID(tenantId)) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: TenantId must be a valid UUID.", HttpStatus.BAD_REQUEST);
      }

      let { limit, offset, filters } = cohortMembersSearchDto;
      // let offset = 0;
      // if (page > 1) {
      //   offset = limit * (page - 1);
      // }

      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });

        if (whereClause["role"] && (!whereClause["cohortId"] && !whereClause["userId"])) {
          return APIResponse.error(res, apiId, "Bad Request", "Invalid input: API did not accept only role. You need to put userId or cohortId.", HttpStatus.BAD_REQUEST);
        }
      }


      // Validate cohortId and userId format
      if (whereClause["cohortId"] && !isUUID(whereClause["cohortId"])) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: CohortId must be a valid UUID.", HttpStatus.BAD_REQUEST);
      }
      if (whereClause["userId"] && !isUUID(whereClause["userId"])) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: UserId must be a valid UUID.", HttpStatus.BAD_REQUEST);
      }
      // Check if cohortId exists
      if (whereClause["cohortId"]) {
        const cohortExists = await this.cohortMembersRepository.findOne({
          where: { cohortId: whereClause["cohortId"] },
        });
        if (!cohortExists) {
          return APIResponse.error(res, apiId, "Not Found", "Invalid input: No member found for this cohortId.", HttpStatus.NOT_FOUND);
        }
      }

      // Check if userId exists
      if (whereClause["userId"]) {
        const userExists = await this.cohortMembersRepository.findOne({
          where: { userId: whereClause["userId"] },
        });
        if (!userExists) {
          return APIResponse.error(res, apiId, "Not Found", "Invalid input: No member found for this userId and cohort combination.", HttpStatus.NOT_FOUND);
        }
      }

      let results = {};
      let where = [];

      if (whereClause["role"]) {
        where.push(["role", whereClause["role"]]);
      }
      if (whereClause["cohortId"]) {
        where.push(["cohortId", whereClause["cohortId"]]);
      }
      if (whereClause["userId"]) {
        where.push(["userId", whereClause["userId"]]);
      }

      let options = [];
      if (limit) {
        options.push(['limit', limit]);
      }
      if (offset) {
        options.push(['offset', offset]);
      }

      let CohortMemberUserDetails = await this.getCohortMemberUserDetails(
        where,
        fieldvalue,
        options
      );
      console.log(CohortMemberUserDetails);

      results = CohortMemberUserDetails['results']
      const totalCount = CohortMemberUserDetails['totalCount'];

      if (CohortMemberUserDetails == false) {
        return APIResponse.error(res, apiId, "Not Found", "Invalid input: No data found.", HttpStatus.NOT_FOUND);
      }

      return APIResponse.success(res, apiId, { totalCount, results }, HttpStatus.OK, "Cohort members details fetched successfully.");


    } catch (e) {
      const errorMessage = e.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCohortMemberUserDetails(where: any, fieldShowHide: string, options: any) {
    let results = {
      userDetails: [],
    };
    let totalCount = 0;

    try {
      let getUserDetails = await this.getUsers(where, options);
      totalCount = getUserDetails.totalCount;


      for (let data of getUserDetails.result) {
        let userDetails = {
          userId: data?.userId,
          userName: data?.userName,
          name: data?.name,
          role: data?.role,
          district: data?.district,
          state: data?.state,
          mobile: data?.mobile
        };

        if (fieldShowHide.toLowerCase() === 'true') {
          const fieldValues = await this.getFieldandFieldValues(data.userId);
          userDetails['customField'] = fieldValues;
          results.userDetails.push(userDetails);
        } else {
          results.userDetails.push(userDetails);
        }
      }

      return {
        totalCount,
        results
      }
    } catch {
      return false;
    }
  }

  public async createCohortMembers(
    loginUser: any,
    cohortMembers: CohortMembersDto,
    res: Response,
    tenantId: string
  ) {
    const apiId = APIID.COHORT_MEMBER_CREATE;
    try {
      cohortMembers.createdBy = loginUser;
      cohortMembers.updatedBy = loginUser;

      const existCohort = await this.cohortRepository.find({
        where: {
          cohortId: cohortMembers.cohortId
        }
      })
      if (existCohort.length == 0) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: Cohort Id does not exist.", HttpStatus.BAD_REQUEST);
      }

      const existUser = await this.usersRepository.find({
        where: {
          userId: cohortMembers.userId,
        }
      })
      if (existUser.length == 0) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: User Id does not exist.", HttpStatus.BAD_REQUEST);
      }

      const existrole = await this.cohortMembersRepository.find({
        where: {
          userId: cohortMembers.userId,
          cohortId: cohortMembers.cohortId
        }
      })
      if (existrole.length > 0) {
        return APIResponse.error(res, apiId, "CONFLICT", `User '${cohortMembers.userId}' is already assigned to cohort '${cohortMembers.cohortId}'.`, HttpStatus.CONFLICT);
      }

      // Create a new CohortMembers entity and populate it with cohortMembers data
      const savedCohortMember = await this.cohortMembersRepository.save(
        cohortMembers
      );

      return APIResponse.success(res, apiId, savedCohortMember, HttpStatus.OK, "Cohort member has been successfully assigned.");

    } catch (e) {
      const errorMessage = e.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsers(where: any, options: any) {

    try {
      let query = ``;
      let whereCase = ``;
      let optionsCase = ``;
      let isRoleCondition = 0;
      let roleCase;
      let fieldValue
      if (where.length > 0) {
        where.forEach((value, index) => {
          if (value[0] == "role") {
            isRoleCondition = 1;
            roleCase = `R."name"='${value[1]}' `;
            fieldValue = value[1];
          } else {
            whereCase += `CM."${value[0]}"='${value[1]}' `;
            if (index != (where.length - 1)) {
              whereCase += ` AND `
            }
          }

        })
      }


      if (options.length > 0) {
        options.forEach((value, index) => {
          optionsCase = `${value[0]} ${value[1]} `;
        })
      }
      let result;
      if (isRoleCondition == 1) {

        let getRoleUserId = `SELECT R."roleId" FROM public."Roles" R WHERE ${roleCase}`
        let roleResult = await this.usersRepository.query(getRoleUserId);
        let roleId = roleResult[0]?.roleId;

        const baseQuery = `FROM public."CohortMembers" CM WHERE ${whereCase}`;

        const countQuery = `SELECT COUNT(*) ${baseQuery}`;

        let getCohortMember = `SELECT "userId" ${baseQuery} ${optionsCase}`

        const countResult = await this.usersRepository.query(countQuery);
        const totalCount = parseInt(countResult[0].count, 10);

        let cohortMemberIds = await this.usersRepository.query(getCohortMember);
        let userIds = cohortMemberIds.map(userId => `'${userId.userId}'`).join(`,`);

        let cohortMembers = `SELECT U."userId", U."username", U."name", U."district", U."state",U."mobile" FROM public."UserRolesMapping" URM
        INNER JOIN public."Users" U
        ON URM."userId" = U."userId"
        WHERE URM."userId" IN(${userIds}) AND URM."roleId"='${roleId}'`;

        let allCohortMembers = await this.usersRepository.query(cohortMembers);

        let result = allCohortMembers.map(member => ({
          ...member,
          role: fieldValue ?? null
        }));
        return {
          totalCount,
          result
        };
        // return result;

      } else {

        query = `SELECT U."userId", U.username, U.name, U.district, U.state,U.mobile FROM public."CohortMembers" CM
        INNER JOIN public."Users" U
        ON CM."userId" = U."userId"
        WHERE ${whereCase} ${optionsCase}`;

        let cohortMember = await this.usersRepository.query(query);

        let userIds = (cohortMember.map(userId => `'${userId.userId}'`).join(`,`));

        let getRole = `
        SELECT R."name", URM."userId" FROM public."Roles" R 
        INNER JOIN "UserRolesMapping" URM 
        ON URM."roleId" = R."roleId"
        WHERE URM."userId" IN (${userIds})`
        let roleName = await this.usersRepository.query(getRole);

        let roleMap = {};

        for (let role of roleName) {
          if (!roleMap[role.userId]) {
            roleMap[role.userId] = [];
          }
          roleMap[role.userId].push(role.name);
        }

        result = cohortMember.map(members => ({
          ...members,
          role: roleMap[members.userId] || []
        }))
      }
      return result;
    } catch {
      return false;
    }



  }



  public async updateCohortMembers(
    cohortMembershipId: string,
    loginUser: any,
    cohortMembersUpdateDto: CohortMembersUpdateDto,
    res: Response,
  ) {
    const apiId = APIID.COHORT_MEMBER_UPDATE;

    try {
      cohortMembersUpdateDto.updatedBy = loginUser;
      if (!isUUID(cohortMembershipId)) {
        return APIResponse.error(res, apiId, "Bad Request", "Invalid input: Please Enter a valid UUID for cohortMemberId.", HttpStatus.BAD_REQUEST);
      }

      const cohortMemberToUpdate = await this.cohortMembersRepository.findOne({
        where: { cohortMembershipId: cohortMembershipId },
      });

      if (!cohortMemberToUpdate) {
        return APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort member not found.", HttpStatus.NOT_FOUND);
      }

      Object.assign(cohortMemberToUpdate, cohortMembersUpdateDto);

      const updatedCohortMember = await this.cohortMembersRepository.save(
        cohortMemberToUpdate
      );

      return APIResponse.success(res, apiId, updatedCohortMember, HttpStatus.OK, "Cohort Member Updated successfully.");

    } catch (e) {
      const errorMessage = e.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  public async deleteCohortMemberById(
    tenantid: any,
    cohortMembershipId: any,
    res: any
  ) {
    const apiId = APIID.COHORT_MEMBER_DELETE;

    try {
      const cohortMember = await this.cohortMembersRepository.find({
        where: {
          cohortMembershipId: cohortMembershipId,
        },
      });

      if (!cohortMember || cohortMember.length === 0) {
        return APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort member not found.", HttpStatus.NOT_FOUND);
      }

      const result = await this.cohortMembersRepository.delete(
        cohortMembershipId
      );

      return APIResponse.success(res, apiId, result, HttpStatus.OK, "Cohort Member deleted Successfully.");
    } catch (e) {
      const errorMessage = e.message || 'Internal server error';
      return APIResponse.error(res, apiId, "Internal Server Error", errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
