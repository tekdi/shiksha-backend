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
import { FieldsService } from "../fields/fields.service";
// import { FieldValues } from "src/fields/entities/field-values.entity";
import { response } from "express";
import APIResponse from "src/utils/response";
import { FieldValues } from "../fields/entities/fields-values.entity";

@Injectable()
export class CohortService {
  private cohort: CohortInterface;

  constructor(
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>,
    // @InjectRepository(FieldValues)
    // private fieldsValuesRepository: Repository<FieldValues>,
    // private readonly fieldsService: FieldsService,
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
          .status(HttpStatus.NOT_FOUND) // Change status to 404 Not Found
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
          cohort, // Send cohort data
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

  public async createCohort(request: any, cohortCreateDto: CohortCreateDto) {
    try{
      const cohortData: any = {};
      Object.keys(cohortCreateDto).forEach((e) => {
          if (cohortCreateDto[e] && cohortCreateDto[e] != "" && e != "fieldValues") {
              if (Array.isArray(cohortCreateDto[e])) {
                  cohortData[e] = JSON.stringify(cohortCreateDto[e]);
              } else {
                  cohortData[e] = cohortCreateDto[e];
              }
          }
      });

      const response = await this.cohortRepository.save(cohortData);
      
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response?.data?.errors[0]?.extensions?.code,
          errorMessage: response?.data?.errors[0]?.message,
        });
      } 
      // else {
      //   const result = response.data.data.insert_Cohort_one;
      //   let fieldCreate = true;
      //   let fieldError = null;
      //   //create fields values
      //   let cohortId = result?.cohortId;
      //   let field_value_array = cohortCreateDto.fieldValues.split("|");

      //   if (field_value_array.length > 0) {
      //     let field_values = [];
      //     for (let i = 0; i < field_value_array.length; i++) {
      //       let fieldValues = field_value_array[i].split(":");
      //       field_values.push({
      //         value: fieldValues[1] ? fieldValues[1] : "",
      //         itemId: cohortId,
      //         fieldId: fieldValues[0] ? fieldValues[0] : "",
      //         createdBy: cohortCreateDto?.createdBy,
      //         updatedBy: cohortCreateDto?.updatedBy,
      //       });
      //     }

      //     const response_field_values =
      //       await this.fieldsService.createFieldValuesBulk(field_values);
      //     if (response_field_values?.data?.errors) {
      //       fieldCreate = false;
      //       fieldError = response_field_values?.data;
      //     }
      //   }

      //   if (fieldCreate) {
      //     return new SuccessResponse({
      //       statusCode: 200,
      //       message: "Ok.",
      //       data: result,
      //     });
      //   } else {
      //     return new ErrorResponse({
      //       errorCode: fieldError?.errors[0]?.extensions?.code,
      //       errorMessage: fieldError?.errors[0]?.message,
      //     });
      //   }
      // }
    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
  }

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortUpdateDto: CohortCreateDto
  ) {
    const cohortUpdateData: any = {};

    Object.keys(cohortUpdateDto).forEach((e) => {
      if (cohortUpdateDto[e] && cohortUpdateDto[e] != "" && e != "fieldValues"
      ) {
        if (Array.isArray(cohortUpdateDto[e])) {
            cohortUpdateData[e] = JSON.stringify(cohortUpdateDto[e]);
        } else {
            cohortUpdateData[e] = cohortUpdateDto[e];
        }
      }
    });

    
    const response = await this.cohortRepository.update(cohortId ,cohortUpdateData);

    // if (response?.data?.errors) {
    //   return new ErrorResponse({
    //     errorCode: response?.data?.errors[0]?.extensions?.code,
    //     errorMessage: response?.data?.errors[0]?.message,
    //   });
    // } 
    // else {
    //   let result = response.data.update_Cohort_by_pk;
    //   let fieldCreate = true;
    //   let fieldError = [];
    //   //update fields values
    //   let field_value_array = cohortUpdateDto.fieldValues.split("|");
    //   if (field_value_array.length > 0) {
    //     for (let i = 0; i < field_value_array.length; i++) {
    //       let fieldValues = field_value_array[i].split(":");
    //       //update values
    //       let fieldValuesUpdate = new FieldValuesDto({
    //         value: fieldValues[1] ? fieldValues[1] : "",
    //       });

    //       const response_field_values =
    //         await this.fieldsService.updateFieldValues(
    //           fieldValues[0] ? fieldValues[0] : "",
    //           fieldValuesUpdate
    //         );
    //       if (response_field_values?.data?.errors) {
    //         fieldCreate = false;
    //         fieldError.push(response_field_values?.data);
    //       }
    //     }
    //   }
    //   if (fieldCreate) {
    //     return new SuccessResponse({
    //       statusCode: 200,
    //       message: "Ok.",
    //       data: result,
    //     });
    //   } else {
    //     return new ErrorResponse({
    //       errorCode: "filed value update error",
    //       errorMessage: JSON.stringify(fieldError),
    //     });
    //   }
    // }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto,
    res: any
  ) {
    try{
      let entityFilter = cohortSearchDto;
      let filedsFilter = entityFilter?.filters["fields"];
      //remove fields from filter
      delete entityFilter.filters["fields"];
      let newCohortSearchDto = null;
      //check fields value present or not
      if (filedsFilter) {
        //apply filter on fields value
        let response_fields_value =
          await this.fieldsService.searchFieldValuesFilter(request,filedsFilter);
        if (response_fields_value?.data?.errors) {
          return res.status(200).send({
            errorCode: response_fields_value?.data?.errors[0]?.extensions?.code,
            errorMessage: response_fields_value?.data?.errors[0]?.message,
          });
        } else {
          //get filter result
          let result_FieldValues = response_fields_value?.data?.data?.FieldValues;
          //fetch cohot id list
          let cohort_id_list = [];
          for (let i = 0; i < result_FieldValues.length; i++) {
            cohort_id_list.push(result_FieldValues[i].itemId);
          }
          //remove duplicate entries
          cohort_id_list = cohort_id_list.filter(
            (item, index) => cohort_id_list.indexOf(item) === index
          );
          let cohort_filter = new Object(entityFilter.filters);
          cohort_filter["cohortId"] = {
            _in: cohort_id_list,
          };
          newCohortSearchDto = new CohortSearchDto({
            limit: entityFilter.limit,
            page: entityFilter.page,
            filters: cohort_filter,
          });
        }
      } else {
        newCohortSearchDto = new CohortSearchDto({
          limit: entityFilter.limit,
          page: entityFilter.page,
          filters: entityFilter.filters,
        });
      }
      if (newCohortSearchDto) {
        const response = await this.searchCohortQuery(
          request,
          tenantId,
          newCohortSearchDto
        );
        if (response?.data?.errors) {
          return res.status(200).send({
            errorCode: response?.data?.errors[0]?.extensions?.code,
            errorMessage: response?.data?.errors[0]?.message,
          });
        } else {
          let result = response?.data?.data?.Cohort;
          let cohortResponse = await this.mappedResponse(result);
          //const count = cohortResponse.length;
          const count = result.length;
          //get cohort fields value
          let result_data = await this.searchCohortFields(
            request,
            tenantId,
            cohortResponse
          );
          return res.status(200).send({
            statusCode: 200,
            message: "Ok.",
            totalCount: count,
            data: result_data,
          });
        }
      } else {
        return res.status(200).send({
          errorCode: "filter invalid",
          errorMessage: "filter invalid",
        });
      }
    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
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
