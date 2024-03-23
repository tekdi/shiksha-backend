import { HttpStatus, Injectable } from "@nestjs/common";
import { CohortInterface } from "./interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FieldsService } from "src/adapters/hasura/services/fields.service";
import { response } from "express";
import APIResponse from "src/utils/response";

@Injectable()
export class CohortService {
  private cohort: CohortInterface;

  constructor(
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
  ) {}

  public async getCohort(
    tenantId: string,
    cohortId: string,
    request: any,
    response: any
  ) {
    const apiId = "api.concept.editminiScreeningAnswer";

    try {
      const cohort = await this.cohortRepository.findOne({
        where: { tenantId: tenantId, cohortId: cohortId },
      });
      if (!cohort) {
        return response
          .status(HttpStatus.NOT_FOUND)
          .send(
            APIResponse.error(
              apiId,
              `Cohort Id is wrong`,
              `Cohort not found`,
              "COHORT_NOT_FOUND"
            )
          );
      }

      return response.status(HttpStatus.OK).send(
        APIResponse.success(
          apiId,
          cohort,
          "Cohort Retrieved Successfully"
        )
      );
    } catch (error) {
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong",
            `Failure Retrieving Cohort. Error is: ${error}`,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
  }

  public async mappedResponse(result: any) {
    const cohortMapping = {
      tenantId: result?.tenantId ? `${result.tenantId}` : "",
      programId: result?.programId ? `${result.programId}` : "",
      cohortId: result?.cohortId ? `${result.cohortId}` : "",
      parentId: result?.parentId ? `${result.parentId}` : "",
      name: result?.name ? `${result.name}` : "",
      type: result?.type ? `${result.type}` : "",
      status: result?.status ? `${result.status}` : "",
      image: result?.image ? `${result.image}` : "",
      createdAt: result?.createdAt ? `${result.createdAt}` : "",
      updatedAt: result?.updatedAt ? `${result.updatedAt}` : "",
      createdBy: result?.createdBy ? `${result.createdBy}` : "",
      updatedBy: result?.updatedBy ? `${result.updatedBy}` : "",
      referenceId: result?.referenceId ? `${result.referenceId}` : "",
      metadata: result?.metadata ? `${result.metadata}` : "",
    };

    return new CohortDto(cohortMapping);
  }
}
