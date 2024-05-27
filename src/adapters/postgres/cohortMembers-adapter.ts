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
    private cohortRepository: Repository<Cohort>
  ) { }

  async getCohortMembers(cohortId: any, tenantId: any, fieldvalue: any, res: Response) {
    const apiId = 'api.get.cohortMembers';
    try {
      const fieldvalues = fieldvalue.toLowerCase()

      if (!tenantId) {
        APIResponse.error(res, apiId, "BAD_REQUEST", `TenantId required`, String(HttpStatus.BAD_REQUEST));
      }

      if (!isUUID(cohortId)) {
        APIResponse.error(res, apiId, "BAD_REQUEST", "Invalid input: CohortId must be a valid UUID.", String(HttpStatus.BAD_REQUEST));
      }

      if (!isUUID(tenantId)) {
        APIResponse.error(res, apiId, "Bad Request", "Invalid input: TenantId must be a valid UUID.", String(HttpStatus.BAD_REQUEST));
      }

      const cohortTenantMap = await this.cohortRepository.find({
        where: {
          cohortId: cohortId,
          tenantId: tenantId
        }
      })
      if (!cohortTenantMap) {
        APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort not found for the provided tenant.", String(HttpStatus.NOT_FOUND));
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

        APIResponse.success(res, apiId, results, String(HttpStatus.OK), "Cohort members details fetched successfully.");
      } else {
        APIResponse.error(res, apiId, "Not Found", "Invalid input: Cohort Member not exist.", String(HttpStatus.NOT_FOUND));
      }
    } catch (e) {
      APIResponse.error(res, apiId, "Internal Server Error", `Error is: ${e}`, String(HttpStatus.INTERNAL_SERVER_ERROR));
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
    tenantId: string,
    res: Response
  ) {
    const apiId = 'api.post.searchCohortMembers';
    try {
      if (!isUUID(tenantId)) {
        APIResponse.error(res, apiId, "Bad Request", "Invalid input: TenantId must be a valid UUID.", String(HttpStatus.BAD_REQUEST));
      }

      let { limit, page, filters } = cohortMembersSearchDto;
      let offset = 0;
      if (page > 1) {
        offset = limit * (page - 1);
      }

      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }

      // Validate cohortId and userId format
      if (whereClause["cohortId"] && !isUUID(whereClause["cohortId"])) {
        APIResponse.error(res, apiId, "Bad Request", "Invalid input: CohortId must be a valid UUID.", String(HttpStatus.BAD_REQUEST));
      }
      if (whereClause["userId"] && !isUUID(whereClause["userId"])) {
        APIResponse.error(res, apiId, "Bad Request", "Invalid input: UserId must be a valid UUID.", String(HttpStatus.BAD_REQUEST));
      }
      // Check if cohortId exists
      if (whereClause["cohortId"]) {
        const cohortExists = await this.cohortMembersRepository.findOne({
          where: { cohortId: whereClause["cohortId"] },
        });
        if (!cohortExists) {
          APIResponse.error(res, apiId, "Not Found", "Invalid input: No member found for this cohortId.", String(HttpStatus.NOT_FOUND));
        }
      }

      // Check if userId exists
      if (whereClause["userId"]) {
        const userExists = await this.cohortMembersRepository.findOne({
          where: { userId: whereClause["userId"] },
        });
        if (!userExists) {
          APIResponse.error(res, apiId, "Not Found", "Invalid input: No member found for this userId and cohort combination.", String(HttpStatus.NOT_FOUND));
        }
      }

      // console.log("USER DATA ",userData)
      let results = {};
      let where = [];
      if (whereClause["cohortId"]) {
        where.push(["cohortId", whereClause["cohortId"]]);
      }
      if (whereClause["userId"]) {
        where.push(["userId", whereClause["userId"]]);
      }
      if (whereClause["role"]) {
        where.push(["role", whereClause["role"]]);
      }
      let options = [];
      if (limit) {
        options.push(['limit', limit]);
      }
      if (offset) {
        options.push(['offset', offset]);
      }

      results = await this.getCohortMemberUserDetails(
        where,
        "true",
        options
      );

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
        data: results,
      });
    } catch (e) {
      console.log(e)
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async getCohortMemberUserDetails(where: any, fieldShowHide: any, options: any) {
    let results = {
      userDetails: [],
    };

    let getUserDetails = await this.getUsers(where, options);

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

      if (fieldShowHide === "false") {
        results.userDetails.push(userDetails);
      } else {
        const fieldValues = await this.getFieldandFieldValues(data.userId);
        userDetails['customField'] = fieldValues;
        results.userDetails.push(userDetails);
      }
    }

    return results;
  }

  public async createCohortMembers(
    loginUser: any,
    cohortMembers: CohortMembersDto,
    response: any
  ) {

    try {
      cohortMembers.createdBy = loginUser;
      cohortMembers.updatedBy = loginUser;

      await this.validateEntity(this.cohortRepository, { cohortId: cohortMembers.cohortId }, `Cohort Id does not exist.`);
      await this.validateEntity(this.usersRepository, { userId: cohortMembers.userId }, `User Id does not exist.`);

      const existrole = await this.cohortMembersRepository.find({
        where: {
          userId: cohortMembers.userId,
          cohortId: cohortMembers.cohortId
        }
      })
      if (existrole.length > 0) {
        throw new ErrorResponseTypeOrm({
          statusCode: HttpStatus.CONFLICT,
          errorMessage: `This user '${cohortMembers.userId}' already assign for this cohort '${cohortMembers.cohortId}'.`,
        });
      }

      // Create a new CohortMembers entity and populate it with cohortMembers data
      const savedCohortMember = await this.cohortMembersRepository.save(
        cohortMembers
      );

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Cohort Member created successfully.",
        data: savedCohortMember,
      });
    } catch (e) {
      if (e instanceof ErrorResponseTypeOrm) {
        return e;
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorMessage: e.toString(), // or any custom error message you want
        });
      }
    }
  }

  async getUsers(where: any, options: any) {
    let query = ``;
    let whereCase = ``;
    let optionsCase = ``;
    let isRoleCondition = 0;
    if (where.length > 0) {
      whereCase = `where `;
      where.forEach((value, index) => {
        if (value[0] == "role") {
          isRoleCondition = 1;
          whereCase += `R."name"='${value[1]}' `;
        } else {
          whereCase += `CM."${value[0]}"='${value[1]}' `;
        }
        if (index != (where.length - 1)) {
          whereCase += ` AND `
        }
      })
    }

    if (options.length > 0) {
      options.forEach((value, index) => {
        optionsCase = `${value[0]} ${value[1]} `;
      })
    }

    if (isRoleCondition == 0) {
      query = `SELECT U."userId", U.username, U.name, R.name AS role, U.district, U.state,U.mobile FROM public."CohortMembers" CM
      INNER JOIN public."Users" U
      ON CM."userId" = U."userId"
      INNER JOIN public."UserRolesMapping" UR
      ON UR."userId" = U."userId"
      INNER JOIN public."Roles" R
      ON R."roleId" = UR."roleId" ${whereCase} ${optionsCase}`;
    }
    else {
      query = `SELECT U."userId", U.username, U.name, R.name AS role, U.district, U.state,U.mobile FROM public."CohortMembers" CM
      INNER JOIN public."Users" U
      ON CM."userId" = U."userId"
      INNER JOIN public."UserRolesMapping" UR
      ON UR."userId" = U."userId"
      INNER JOIN public."Roles" R
      ON R."roleId" = UR."roleId" ${whereCase} ${optionsCase}`;
    }
    let result = await this.usersRepository.query(query);
    return result;

  }

  async validateEntity(repository, whereCondition, errorMessage) {
    const validation = await repository.find({ where: whereCondition });
    if (validation.length == 0) {
      throw new ErrorResponseTypeOrm({
        statusCode: HttpStatus.CONFLICT,
        errorMessage: errorMessage,
      });
    }
  }

  public async updateCohortMembers(
    cohortMembershipId: string,
    loginUser: any,
    cohortMembersUpdateDto: CohortMembersUpdateDto,
    response: any
  ) {
    const apiId = "api.cohortMember.updateCohortMembers";

    try {
      cohortMembersUpdateDto.updatedBy = loginUser;
      if (!isUUID(cohortMembershipId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter a valid UUID for cohortMemberId",
        });
      }

      // Find the cohort member to update
      const cohortMemberToUpdate = await this.cohortMembersRepository.findOne({
        where: { cohortMembershipId: cohortMembershipId },
      });

      // If cohort member not found, return error
      if (!cohortMemberToUpdate) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Cohort member not found",
        });
      }

      // Update cohort member with provided data
      Object.assign(cohortMemberToUpdate, cohortMembersUpdateDto);

      // Save updated cohort member
      const updatedCohortMember = await this.cohortMembersRepository.save(
        cohortMemberToUpdate
      );

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Cohort Member Updated successfully.",
        data: updatedCohortMember,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }


  public async deleteCohortMemberById(
    cohortMembershipId: any,
    response: any,
    request: any
  ) {
    const apiId = "api.cohortMember.deleteCohortMemberById";

    try {
      const cohortMember = await this.cohortMembersRepository.find({
        where: {
          cohortMembershipId: cohortMembershipId,
        },
      });

      if (!cohortMember || cohortMember.length === 0) {
        return response.status(HttpStatus.NOT_FOUND).send({
          error: "Cohort member not found",
        });
      }

      const result = await this.cohortMembersRepository.delete(
        cohortMembershipId
      );

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Cohort Member deleted Successfully.",
        data: result,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }
}
