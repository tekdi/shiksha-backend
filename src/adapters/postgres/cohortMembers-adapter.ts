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

@Injectable()
export class PostgresCohortMembersService {
  constructor(
    @InjectRepository(CohortMembers)
    private cohortMembersRepository: Repository<CohortMembers>,
    @InjectRepository(Fields)
    private fieldsRepository: Repository<Fields>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async getCohortMembers(
    userId: any,

    fieldvalue: any
  ) {
    try {
      if (fieldvalue === "false") {
        const result = {
          userData: {},
        };

        let customFieldsArray = [];

        const [userDetails] = await Promise.all([this.findUserDetails(userId)]);
        result.userData = userDetails;
        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Ok.",
          data: result,
        });
      } else {
        const result = {
          userData: {},
        };

        let customFieldsArray = [];

        const [filledValues, userDetails] = await Promise.all([
          this.findFilledValues(userId),
          this.findUserDetails(userId),
        ]);

        const customFields = await this.findCustomFields(userDetails.role);

        result.userData = userDetails;
        const filledValuesMap = new Map(
          filledValues.map((item) => [item.fieldId, item.value])
        );
        for (let data of customFields) {
          const fieldValue = filledValuesMap.get(data.fieldId);
          const customField = {
            fieldId: data.fieldId,
            label: data.label,
            value: fieldValue || "",
            options: data?.fieldParams?.["options"] || {},
            type: data.type || "",
          };
          customFieldsArray.push(customField);
        }
        result.userData["customFields"] = customFieldsArray;

        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: "Ok.",
          data: result,
        });
      }
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async findFilledValues(userId: string) {
    let query = `SELECT U."userId",F."fieldId",F."value" FROM public."Users" U 
    LEFT JOIN public."FieldValues" F
    ON U."userId" = F."itemId" where U."userId" =$1`;
    let result = await this.usersRepository.query(query, [userId]);
    return result;
  }

  async findUserDetails(userId, username?: any) {
    let whereClause: any = { userId: userId };
    if (username && userId === null) {
      delete whereClause.userId;
      whereClause.username = username;
    }
    let userDetails = await this.usersRepository.findOne({
      where: whereClause,
    });
    return userDetails;
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

  async findUsertDetails(userId: string) {
    let whereClause: any = { userId: userId };
    let userDetails = await this.usersRepository.findOne({
      where: whereClause,
    });
    return userDetails;
  }
  async searchFindCustomFields() {
    let customFields = await this.fieldsRepository.find({
      where: {
        context: "COHORT",
        contextType: "COHORT",
      },
    });
    return customFields;
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

      const [userData] = await this.cohortMembersRepository.findAndCount({
        where: whereClause,
        skip: offset,
        take: parseInt(limit),
      });
      let results = {
        userDetails: [],
      };

      if (whereClause["cohortId"]) {
        let req = 1;
        let cohortDetails = await this.getUsersDetailsByCohortId(
          whereClause["cohortId"],
          req
        );
        results.userDetails.push(cohortDetails);
      }

      if (whereClause["userId"]) {
        let fieldvalue = 1;

        let cohortDetails = await this.getCohortMembers(
          whereClause["userId"],
          fieldvalue
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

  async getUsersDetailsByCohortId(cohortId: any, response: any) {
    let apiId = "api.users.getAllUsersDetails";
    try {
      let getUserDetails = await this.findUserName(cohortId);

      let result = {
        userDetails: [],
      };

      for (let data of getUserDetails) {
        let userDetails = {
          userId: data.userId,
          userName: data.userName,
          name: data.name,
          role: data.role,
          district: data.district,
          state: data.state,
          mobile: data.mobile,
          customField: [],
        };
        const fieldValues = await this.getFieldandFieldValues(data.userId);

        userDetails.customField.push(fieldValues);

        result.userDetails.push(userDetails);
      }

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: "Ok.",
        data: result,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async findUserName(cohortId: string) {
    let query = `SELECT U."userId", U.username, U.name, U.role, U.district, U.state,U.mobile FROM public."CohortMembers" CM   
    LEFT JOIN public."Users" U 
    ON CM."userId" = U."userId"
    where CM."cohortId" =$1 `;

    let result = await this.usersRepository.query(query, [cohortId]);

    return result;
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

  public async createCohortMembers(
    request: any,
    cohortMembers: CohortMembersDto,
    response: any
  ) {
    const apiId = "api.cohortMember.createCohortMembers";

    try {
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
    request: any,
    cohortMembersUpdateDto: CohortMembersUpdateDto,
    response: any
  ) {
    const apiId = "api.cohortMember.updateCohortMembers";

    try {
      const cohortMemberToUpdate = await this.cohortMembersRepository.findOne({
        where: { cohortMembershipId: cohortMembershipId },
      });

      if (!cohortMemberToUpdate) {
        throw new Error("Cohort member not found");
      }
      Object.assign(cohortMemberToUpdate, cohortMembersUpdateDto);

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
