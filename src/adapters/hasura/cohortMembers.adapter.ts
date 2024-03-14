import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { IServicelocatorcohortMembers } from "../cohortMembersservicelocator";

@Injectable()
export class HasuraCohortMembersService
  implements IServicelocatorcohortMembers
{
  constructor(private httpService: HttpService) {}

  public async createCohortMembers(
    request: any,
    cohortMembers: CohortMembersDto
  ) {
    try{
      var axios = require("axios");
      let query = "";
      Object.keys(cohortMembers).forEach((e) => {
        if (cohortMembers[e] && cohortMembers[e] != "") {
          if (Array.isArray(cohortMembers[e])) {
            query += `${e}: "${JSON.stringify(cohortMembers[e])}", `;
          } else {
            query += `${e}: "${cohortMembers[e]}", `;
          }
        }
      });

      var data = {
        query: `mutation CreateCohortMembers {
          insert_CohortMembers_one(object: {${query}}) {
          cohortMembershipId
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
        return new ErrorResponse({
          errorCode: response?.data?.errors[0]?.extensions?.code,
          errorMessage: response?.data?.errors[0]?.message,
        });
      } else {
        const result = response.data.data.insert_CohortMembers_one;
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });
      }
    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: e,
      });
    }
  }

  public async getCohortMembers(
    tenantId: string,
    cohortMembershipId: any,
    request: any
  ) {
    var axios = require("axios");

    var data = {
      query: `query GetCohortMembers($cohortMembershipId:uuid!, $tenantId:uuid!) {
        CohortMembers(
          where:{
            tenantId:{
              _eq:$tenantId
            }
            cohortMembershipId:{
              _eq:$cohortMembershipId
            },
          }
        ){
          tenantId
          cohortMembershipId
          cohortId
          userId
          role
          createdAt
          updatedAt
          createdBy
          updatedBy
      }
    }`,
      variables: {
        cohortMembershipId: cohortMembershipId,
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
      let result = response?.data?.data?.CohortMembers;
      const cohortMembersResponse = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: cohortMembersResponse[0],
      });
    }
  }

  public async searchCohortMembers(
    tenantId: string,
    request: any,
    cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    try{
      var axios = require("axios");

      let offset = 0;
      if (cohortMembersSearchDto.page > 1) {
        offset =
          parseInt(cohortMembersSearchDto.limit) *
          (cohortMembersSearchDto.page - 1);
      }

      let temp_filters = cohortMembersSearchDto.filters;
      //add tenantid
      let filters = new Object(temp_filters);
      filters["tenantId"] = { _eq: tenantId ? tenantId : "" };

      Object.keys(cohortMembersSearchDto.filters).forEach((item) => {
        Object.keys(cohortMembersSearchDto.filters[item]).forEach((e) => {
          if (!e.startsWith("_")) {
            filters[item][`_${e}`] = filters[item][e];
            delete filters[item][e];
          }
        });
      });
      var data = {
        query: `query SearchCohortMembers($filters:CohortMembers_bool_exp,$limit:Int, $offset:Int) {
            CohortMembers(where:$filters, limit: $limit, offset: $offset,) {
              tenantId
              cohortMembershipId
              cohortId
              userId
              role
              createdAt
              updatedAt
              createdBy
              updatedBy
              }
            }`,
        variables: {
          limit: parseInt(cohortMembersSearchDto.limit),
          offset: offset,
          filters: cohortMembersSearchDto.filters,
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
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response?.data?.errors[0]?.extensions?.code,
          errorMessage: response?.data?.errors[0]?.message,
        });
      } else {
        let result = response.data.data.CohortMembers;
        const cohortMembersResponse = await this.mappedResponse(result);
        const count = cohortMembersResponse.length;
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          totalCount: count,
          data: cohortMembersResponse,
        });
      }
    }catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: e,
      });
    }
  }

  public async updateCohortMembers(
    cohortMembershipId: string,
    request: any,
    cohortMembersDto: CohortMembersDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortMembersDto).forEach((e) => {
      if (cohortMembersDto[e] && cohortMembersDto[e] != "") {
        if (Array.isArray(cohortMembersDto[e])) {
          query += `${e}: "${JSON.stringify(cohortMembersDto[e])}", `;
        } else {
          query += `${e}: "${cohortMembersDto[e]}", `;
        }
      }
    });

    var data = {
      query: `
      mutation UpdateCohortMembers($cohortMembershipId:uuid!) {
        update_CohortMembers_by_pk(
            pk_columns: {
              cohortMembershipId: $cohortMembershipId
            },
            _set: {
                ${query}
            }
        ) {
            cohortMembershipId
        }
    }
    `,
      variables: {
        cohortMembershipId: cohortMembershipId,
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
    const cohortMembersResponse = result.map((obj: any) => {
      const cohortMembersMapping = {
        tenantId: obj?.tenantId ? `${obj.tenantId}` : "",
        cohortMembershipId: obj?.cohortMembershipId
          ? `${obj.cohortMembershipId}`
          : "",
        cohortId: obj?.cohortId ? `${obj.cohortId}` : "",
        userId: obj?.userId ? `${obj.userId}` : "",
        role: obj?.role ? `${obj.role}` : "",
        createdAt: obj?.createdAt ? `${obj.createdAt}` : "",
        updatedAt: obj?.updatedAt ? `${obj.updatedAt}` : "",
        createdBy: obj?.createdBy ? `${obj.createdBy}` : "",
        updatedBy: obj?.updatedBy ? `${obj.updatedBy}` : "",
      };
      return new CohortMembersDto(cohortMembersMapping);
    });

    return cohortMembersResponse;
  }
}
