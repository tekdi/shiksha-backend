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
import APIResponse from "src/utils/response";
import { HttpStatus } from "@nestjs/common";
import response from "src/utils/response";
import { User } from "src/user/entities/user-entity";
import { CohortMembersUpdateDto } from "src/cohortMembers/dto/cohortMember-update.dto";
import { ErrorResponseTypeOrm } from "src/error-response-typeorm";
import { Fields } from "src/fields/entities/fields.entity";
import { UUID } from "typeorm/driver/mongodb/bson.typings";
import { isUUID } from "class-validator";
import { Cohort } from "src/cohort/entities/cohort.entity";
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
  ) {}

  async getCohortMembers(cohortId: any, fieldvalue: any) {
    try {
      if (!isUUID(cohortId)) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter valid (UUID)",
        });
      }
      const userDetails = await this.findcohortData(cohortId);
      if (userDetails === true) {
        let results = {
          userDetails: [],
        };

        let cohortDetails = await this.getUserDetails(
          cohortId,
          "cohortId",
          fieldvalue
        );
        results.userDetails.push(cohortDetails);
        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Ok.",
          data: results,
        });
      } else {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.NOT_FOUND,
          errorMessage: "Cohort Member not exist",
        });
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
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
        mobile: data?.mobile,
        customField: [],
      };

      if (fieldShowHide === "false") {
        results.userDetails.push(userDetails);
      } else {
        const fieldValues = await this.getFieldandFieldValues(data.userId);
        userDetails.customField.push(fieldValues);
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
    let query = `SELECT U."userId", U.username, U.name, U.role, U.district, U.state,U.mobile FROM public."CohortMembers" CM
    LEFT JOIN public."Users" U
    ON CM."userId" = U."userId" ${whereCase}`;

    let result = await this.usersRepository.query(query, [searchData]);
    return result;
  }
  public async searchCohortMembers(
    cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    try {
      let { limit, page, filters } = cohortMembersSearchDto;
      let offset = 0;
      if (page > 1) {
        offset = parseInt(limit) * (page - 1);
      }
      if (limit.trim() === "") {
        limit = "0";
      }
      const whereClause = {};
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          whereClause[key] = value;
        });
      }

      // Validate cohortId and userId format
      if (whereClause["cohortId"] && !isUUID(whereClause["cohortId"])) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter a valid UUID for cohortId",
        });
      }
      if (whereClause["userId"] && !isUUID(whereClause["userId"])) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.BAD_REQUEST,
          errorMessage: "Please Enter a valid UUID for userId",
        });
      }
      // Check if cohortId exists
      if (whereClause["cohortId"]) {
        const cohortExists = await this.cohortMembersRepository.findOne({
          where: { cohortId: whereClause["cohortId"] },
        });
        if (!cohortExists) {
          return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.NOT_FOUND,
            errorMessage: "Cohort Member with specified cohortId not found",
          });
        }
      }

      // Check if userId exists
      if (whereClause["userId"]) {
        const userExists = await this.cohortMembersRepository.findOne({
          where: { userId: whereClause["userId"] },
        });
        if (!userExists) {
          return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.NOT_FOUND,
            errorMessage: "Cohort Member with specified userId not found",
          });
        }
      }
      const [userData] = await this.cohortMembersRepository.findAndCount({
        where: whereClause,
        skip: offset,
        take: parseInt(limit),
      });
      let results = {
        userDetails: [],
      };
      if (whereClause["cohortId"]) {
        let cohortDetails = await this.getUserDetails(
          whereClause["cohortId"],
          "cohortId",
          "true"
        );
        results.userDetails.push(cohortDetails);
      }
      if (whereClause["userId"]) {
        let cohortDetails = await this.getUserDetails(
          whereClause["userId"],
          "userId",
          "true"
        );
        results.userDetails.push(cohortDetails);
      }

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
        data: results,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  public async createCohortMembers(
    loginUser: any,
    cohortMembers: CohortMembersDto,
    response: any
  ) {
    const apiId = "api.cohortMember.createCohortMembers";

    try {
      cohortMembers.createdBy = loginUser;
      cohortMembers.updatedBy = loginUser;
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
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
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
    tenantId: string,
    cohortMembershipId: any,
    response: any,
    request: any
  ) {
    const apiId = "api.cohortMember.deleteCohortMemberById";

    try {
      const cohortMember = await this.cohortMembersRepository.find({
        where: {
          tenantId: tenantId,
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
