import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembers } from "./entities/cohort-member.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { CohortDto } from "../cohort/dto/cohort.dto";
import APIResponse from "src/utils/response";
import { HttpStatus } from "@nestjs/common";
import response from "src/utils/response";
import { User } from "src/user/entities/user-entity";
import { CohortMembersUpdateDto } from "./dto/cohortMember-update.dto";

@Injectable()
export class CohortMembersService {
  constructor(
    @InjectRepository(CohortMembers)
    private cohortMembersRepository: Repository<CohortMembers>
  ) {}

  public async getCohortMembers(
    tenantId: string,
    cohortMembershipId: any,
    response: any,
    request: any
  ) {
    const apiId = "api.cohortMember.getCohortMembers";
    try {
      const cohortMembers = await this.cohortMembersRepository.find({
        where: {
          tenantId: tenantId,
          cohortMembershipId: cohortMembershipId,
        },
      });
      if (!cohortMembers || cohortMembers.length === 0) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .send(
            APIResponse.error(
              apiId,
              `Cohort Member Id is wrong`,
              `Cohort Member not found`,
              "COHORT_Member_NOT_FOUND"
            )
          );
      }

      return response
        .status(HttpStatus.OK)
        .send(
          APIResponse.success(
            apiId,
            cohortMembers,
            "Cohort Member Retrieved Successfully"
          )
        );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure Retrieving Cohort Member. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
  }

  public async searchCohortMembers(
    tenantId: string,
    request: any,
    cohortMembersSearchDto: CohortMembersSearchDto,
    response: any
  ) {
    const apiId = "api.cohortMember.searchCohortMembers";

    try {
      let offset = 0;
      if (cohortMembersSearchDto.page > 1) {
        offset =
          parseInt(cohortMembersSearchDto.limit) *
          (cohortMembersSearchDto.page - 1);
      }

      let filters: any = { tenantId: tenantId || "" };
      const tempFilters = { ...cohortMembersSearchDto.filters };

      // Convert filter keys to match TypeORM column names
      Object.keys(tempFilters).forEach((item) => {
        Object.keys(tempFilters[item]).forEach((e) => {
          if (!e.startsWith("_")) {
            tempFilters[item][`_${e}`] = tempFilters[item][e];
            delete tempFilters[item][e];
          }
        });
      });

      filters = { ...filters, ...tempFilters };

      const takeLimit = parseInt(cohortMembersSearchDto.limit); // Parse limit value here

      const [cohortMembers, count] =
        await this.cohortMembersRepository.findAndCount({
          where: filters,
          take: takeLimit, // Use parsed limit value here
          skip: offset,
        });
      const responseData = {
        totalCount: count,
        cohortMembers: cohortMembers,
      };

      return response
        .status(HttpStatus.OK)
        .send(
          APIResponse.success(
            apiId,
            responseData,
            "Cohort Member Retrieved Successfully"
          )
        );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure Retrieving Cohort Member. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
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

      return response
        .status(HttpStatus.OK)
        .send(
          APIResponse.success(
            apiId,
            savedCohortMember,
            "Cohort Member created Successfully"
          )
        );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure creating Cohort Member. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
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

      return response
        .status(HttpStatus.OK)
        .send(
          APIResponse.success(
            apiId,
            updatedCohortMember,
            "Cohort Member updated Successfully"
          )
        );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure updating Cohort Member. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
  }
}
