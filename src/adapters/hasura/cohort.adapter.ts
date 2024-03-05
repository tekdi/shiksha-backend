import { Injectable } from "@nestjs/common";
import { CohortInterface } from "../../cohort/interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { IServicelocatorcohort } from "../cohortservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
import { FieldsService } from "./services/fields.service";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import * as winston from 'winston';



export const HasuraCohortToken = "HasuraCohort";
@Injectable()
export class HasuraCohortService implements IServicelocatorcohort {
  private cohort: CohortInterface;

  constructor(
    private httpService: HttpService,
    private fieldsService: FieldsService
  ) {}

  //Create multiple cohort
  public async multipleCohortsCreate(request: any, cohortDto: [CohortCreateDto]) {
    const responses = [];
    const errorsMsg = [];
    try{
      var count = 0;
      let success =0;
      let error =0;
      // console.log(request);
      
      for (const cohortCreateDto of cohortDto) {
        await this.singleCreateCohort(errorsMsg, responses, count, success, error, request, cohortCreateDto);
      }
    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
    return {
      statusCode: 200,
      totalCount: cohortDto.length,
      successCount: responses.length,
      responses,
      errorsMsg,
    };
  }

  //Create single cohort
  public async createCohort(request: any, cohortCreateDto: CohortCreateDto) {
    const errorsMsg = [];
    const responses = [];
    let count = 0;
    let success = 0;
    let error = 0;

    // Call singleCreateCohort function passing necessary arguments
    await this.singleCreateCohort(errorsMsg, responses, count, success, error, request, cohortCreateDto);
    return {
      statusCode: 200,
      // totalCount: cohortCreateDto.length,
      successCount: responses.length,
      responses,
      errorsMsg,
    };
  }
  
  // Public function for creating Cohort
  public async singleCreateCohort(errorsMsg:any, responses:any,count:any, success:any, error:any, request: any, cohortCreateDto: CohortCreateDto){

    const logger = winston.createLogger({
      transports: [
        new winston.transports.File({ filename: 'import_cohort.log' }) // Log file for import
      ]
    });

    try{
      var axios = require("axios");

      let query = "";
      Object.keys(cohortCreateDto).forEach((e) => {
        if (
          cohortCreateDto[e] &&
          cohortCreateDto[e] != "" &&
          e != "fieldValues"
        ) {
          if (Array.isArray(cohortCreateDto[e])) {
            query += `${e}: "${JSON.stringify(cohortCreateDto[e])}", `;
          } else {
            query += `${e}: "${cohortCreateDto[e]}", `;
          }
        }
      });

      var data = {
        query: `mutation CreateCohort {
          insert_Cohort_one(object: {${query}}) {
          cohortId
          }
        }
        `,
        variables: {},
      };

      var config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(config);
      if (response?.data?.errors) {
        errorsMsg.push(response?.data?.errors[0]?.message);
        logger.info(`${count++}. ${cohortCreateDto.name} : ${response?.data?.errors[0]?.message} `);
      } else {
        const result = response.data.data.insert_Cohort_one;
        let fieldCreate = true;
        let fieldError = null;
        //create fields values
        let cohortId = result?.cohortId;
        let field_value_array = cohortCreateDto.fieldValues.split("|");

        if (field_value_array.length > 0) {
          let field_values = [];
          for (let i = 0; i < field_value_array.length; i++) {
            let fieldValues = field_value_array[i].split(":");
            field_values.push({
              value: fieldValues[1] ? fieldValues[1] : "",
              itemId: cohortId,
              fieldId: fieldValues[0] ? fieldValues[0] : "",
              createdBy: cohortCreateDto?.createdBy,
              updatedBy: cohortCreateDto?.updatedBy,
            });
          }

          const response_field_values =
            await this.fieldsService.createFieldValuesBulk(field_values);
          if (response_field_values?.data?.errors) {
            fieldCreate = false;
            fieldError = response_field_values?.data;
          }
        }

        if (fieldCreate) {
          responses.push(result);
          logger.info(`${count++}. ${cohortCreateDto.name} : "Cohort imported successfully." `);
          success++;
        } else {
          errorsMsg.push(fieldError?.errors[0]?.message);
          logger.info(`${count++}. ${cohortCreateDto.name} : ${fieldError?.errors[0]?.message} `);
          error++;
        }
      }
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "401",
        errorMessage: e,
      });
    }
  }


  public async getCohort(
    tenantId: string,
    cohortId: any,
    request: any,
    res: any
  ) {
    var axios = require("axios");

    var data = {
      query: `query GetCohort($cohortId:uuid!, $tenantId:uuid!, $context:String!, $contextId:uuid!) {
        Cohort(
          where:{
            tenantId:{
              _eq:$tenantId
            }
            cohortId:{
              _eq:$cohortId
            },
          }
        ){
          tenantId
          programId
          cohortId
          parentId
          referenceId
          name
          type
          status
          image
          attendanceCaptureImage
          metadata
          createdAt
          updatedAt
          createdBy
          updatedBy
          fields: CohortFieldsTenants(
              where:{
                _or:[
                  {
                    tenantId:{
                      _eq:$tenantId
                    }
                    context:{
                      _eq:$context
                    }
                    contextId:{
                      _is_null:true
                    }
                  },
                  {
                    tenantId:{
                      _eq:$tenantId
                    }
                    context:{
                      _eq:$context
                    }
                    contextId:{
                      _eq:$contextId
                    }
                  }
                ]
              }
            ){
              tenantId
              fieldId
              assetId
              context
              contextId
              render
              groupId
              name
              label
              defaultValue
              type
              note
              description
              state
              required
              ordering
              metadata
              access
              onlyUseInSubform
              createdAt
              updatedAt
              createdBy
              updatedBy
              fieldValues: FieldValues(
                where:{
                  itemId:{
                    _eq:$contextId
                  },
                }
              ){
                  value
                  fieldValuesId
                  itemId
                  fieldId
                  createdAt
                  updatedAt
                  createdBy
                  updatedBy
            }
          }
        }
    }`,
      variables: {
        cohortId: cohortId,
        tenantId: tenantId,
        context: "Cohort",
        contextId: cohortId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    if (response?.data?.errors) {
      return res.status(200).send({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response?.data?.data?.Cohort;
      return res.status(200).send({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
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

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortUpdateDto: CohortCreateDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortUpdateDto).forEach((e) => {
      if (
        cohortUpdateDto[e] &&
        cohortUpdateDto[e] != "" &&
        e != "fieldValues"
      ) {
        if (Array.isArray(cohortUpdateDto[e])) {
          query += `${e}: "${JSON.stringify(cohortUpdateDto[e])}", `;
        } else {
          query += `${e}: "${cohortUpdateDto[e]}", `;
        }
      }
    });

    var data = {
      query: `
      mutation UpdateCohort($cohortId:uuid!) {
        update_Cohort_by_pk(
            pk_columns: {
              cohortId: $cohortId
            },
            _set: {
                ${query}
            }
        ) {
            cohortId
        }
    }
    `,
      variables: {
        cohortId: cohortId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response.data.update_Cohort_by_pk;
      let fieldCreate = true;
      let fieldError = [];
      //update fields values
      let field_value_array = cohortUpdateDto.fieldValues.split("|");
      if (field_value_array.length > 0) {
        for (let i = 0; i < field_value_array.length; i++) {
          let fieldValues = field_value_array[i].split(":");
          //update values
          let fieldValuesUpdate = new FieldValuesDto({
            value: fieldValues[1] ? fieldValues[1] : "",
          });

          const response_field_values =
            await this.fieldsService.updateFieldValues(
              fieldValues[0] ? fieldValues[0] : "",
              fieldValuesUpdate
            );
          if (response_field_values?.data?.errors) {
            fieldCreate = false;
            fieldError.push(response_field_values?.data);
          }
        }
      }
      if (fieldCreate) {
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });
      } else {
        return new ErrorResponse({
          errorCode: "filed value update error",
          errorMessage: JSON.stringify(fieldError),
        });
      }
    }
  }

  public async mappedResponse(result: any) {
    const cohortResponse = result.map((item: any) => {
      const cohortMapping = {
        tenantId: item?.tenantId ? `${item.tenantId}` : "",
        programId: item?.programId ? `${item.programId}` : "",
        cohortId: item?.cohortId ? `${item.cohortId}` : "",
        parentId: item?.parentId ? `${item.parentId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        status: item?.status ? `${item.status}` : "",
        image: item?.image ? `${item.image}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        referenceId: item?.referenceId ? `${item.referenceId}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
      };
      return new CohortDto(cohortMapping);
    });

    return cohortResponse;
  }

  public async searchCohortFields(request:any ,tenantId: string, cohorts: any) {
    let cohort_fields = [];
    for (let i = 0; i < cohorts.length; i++) {
      let new_obj = new Object(cohorts[i]);
      let cohortId = new_obj["cohortId"];
      //get fields
      let response = await this.fieldsService.getFieldsContext(
        request,
        tenantId,
        "Cohort",
        cohortId
      );
      if (response?.data?.errors) {
      } else {
        let result = response?.data?.data?.Fields;
        new_obj["fields"] = result;
      }
      cohort_fields.push(new_obj);
    }
    return cohort_fields;
  }
  public async searchCohortQuery(
    request:any,
    tenantId: string,
    cohortSearchDto: CohortSearchDto
  ) {
    try{
      var axios = require("axios");

      let offset = 0;
      if (cohortSearchDto.page > 1) {
        offset = parseInt(cohortSearchDto.limit) * (cohortSearchDto.page - 1);
      }

      let temp_filters = cohortSearchDto.filters;
      //add tenantid
      let filters = new Object(temp_filters);
      filters["tenantId"] = { _eq: tenantId ? tenantId : "" };

      Object.keys(cohortSearchDto.filters).forEach((item) => {
        Object.keys(cohortSearchDto.filters[item]).forEach((e) => {
          if (!e.startsWith("_")) {
            filters[item][`_${e}`] = filters[item][e];
            delete filters[item][e];
          }
        });
      });
      var data = {
        query: `query SearchCohort($filters:Cohort_bool_exp,$limit:Int, $offset:Int) {
            Cohort(where:$filters, limit: $limit, offset: $offset,) {
                tenantId
                programId
                cohortId
                parentId
                referenceId
                name
                type
                status
                image
                metadata
                createdAt
                updatedAt
                createdBy
                updatedBy
              }
            }`,
        variables: {
          limit: parseInt(cohortSearchDto.limit),
          offset: offset,
          filters: cohortSearchDto.filters,
        },
      };
      var config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await axios(config);
      return response;

    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: e,
      });
    }
  }
}
