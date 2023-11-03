import { Injectable } from "@nestjs/common";
import { CohortInterface } from "../../cohort/interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { IServicelocatorcohort } from "../cohortservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
import { FieldsService } from "./services/fields.service";
export const HasuraCohortToken = "HasuraCohort";
@Injectable()
export class HasuraCohortService implements IServicelocatorcohort {
  private cohort: CohortInterface;

  constructor(
    private httpService: HttpService,
    private fieldsService: FieldsService
  ) {}

  url = `${process.env.BASEAPIURL}`;

  public async createCohort(request: any, cohortDto: CohortDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortDto).forEach((e) => {
      if (cohortDto[e] && cohortDto[e] != "") {
        if (Array.isArray(cohortDto[e])) {
          query += `${e}: "${JSON.stringify(cohortDto[e])}", `;
        } else {
          query += `${e}: "${cohortDto[e]}", `;
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
      const result = response.data.data.insert_Cohort_one;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
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
      query: `query GetCohort($cohortId:uuid!, $tenantId:uuid!) {
        Cohort(
          where:{
            TenantId:{
              _eq:$tenantId
            }
            cohortId:{
              _eq:$cohortId
            },
          }
        ){
          TenantId
          ProgramId
          cohortId
          parentId
          referenceId
          name
          type
          status
          image
          metadata
          created_at
          updated_at
          createdBy
          updatedBy
        }
    }`,
      variables: {
        cohortId: cohortId,
        tenantId: tenantId,
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
      let result = response?.data?.data?.Cohort;
      let cohortResponse = await this.mappedResponse(result);
      //get cohort fields value
      let result_data = await this.getCohortFields(tenantId, cohortResponse);
      return res.status(200).send({
        statusCode: 200,
        message: "Ok.",
        data: result_data,
      });
    }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto,
    res: any
  ) {
    var axios = require("axios");

    let offset = 0;
    if (cohortSearchDto.page > 1) {
      offset = parseInt(cohortSearchDto.limit) * (cohortSearchDto.page - 1);
    }

    let temp_filters = cohortSearchDto.filters;
    //add tenantid
    let filters = new Object(temp_filters);
    filters["TenantId"] = { _eq: tenantId ? tenantId : "" };

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
              TenantId
              ProgramId
              cohortId
              parentId
              referenceId
              name
              type
              status
              image
              metadata
              created_at
              updated_at
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
      let result = response?.data?.data?.Cohort;
      let cohortResponse = await this.mappedResponse(result);
      const count = cohortResponse.length;
      //get cohort fields value
      let result_data = await this.getCohortFields(tenantId, cohortResponse);
      return res.status(200).send({
        statusCode: 200,
        message: "Ok.",
        totalCount: count,
        data: result_data,
      });
    }
  }

  public async updateCohort(
    cohortId: string,
    request: any,
    cohortDto: CohortDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortDto).forEach((e) => {
      if (cohortDto[e] && cohortDto[e] != "") {
        if (Array.isArray(cohortDto[e])) {
          query += `${e}: "${JSON.stringify(cohortDto[e])}", `;
        } else {
          query += `${e}: "${cohortDto[e]}", `;
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
      let result = response.data.data;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async mappedResponse(result: any) {
    const cohortResponse = result.map((item: any) => {
      const cohortMapping = {
        TenantId: item?.TenantId ? `${item.TenantId}` : "",
        ProgramId: item?.ProgramId ? `${item.ProgramId}` : "",
        cohortId: item?.cohortId ? `${item.cohortId}` : "",
        parentId: item?.parentId ? `${item.parentId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        status: item?.status ? `${item.status}` : "",
        image: item?.image ? `${item.image}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        referenceId: item?.referenceId ? `${item.referenceId}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
      };
      return new CohortDto(cohortMapping);
    });

    return cohortResponse;
  }

  public async getCohortFields(tenantId: string, cohorts: any) {
    let cohort_fields = [];
    for (let i = 0; i < cohorts.length; i++) {
      let new_obj = new Object(cohorts[i]);
      //get fields value
      let response = await this.fieldsService.getFieldValuesItemId(
        new_obj["cohortId"]
      );
      if (response?.data?.errors) {
      } else {
        let result = response?.data?.data?.field_values;
        let fields_value = [];
        for (let i = 0; i < result.length; i++) {
          let new_obj_key = new Object(result[i]);
          let field_id = new_obj_key["field_id"];
          //get fields
          let response_fields = await this.fieldsService.getFields(
            tenantId,
            field_id
          );
          if (response_fields?.data?.errors) {
          } else {
            let result_fields = response_fields?.data?.data?.fields;
            new_obj_key["fields"] = result_fields[0];
          }
          fields_value.push(new_obj_key);
        }
        new_obj["field_values"] = fields_value;
      }
      cohort_fields.push(new_obj);
    }
    return cohort_fields;
  }
}
