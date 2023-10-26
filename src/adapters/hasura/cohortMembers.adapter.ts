import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
const resolvePath = require("object-resolve-path");
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";
import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";

@Injectable()
export class CohortMembersService {
  constructor(private httpService: HttpService) {}

  url = `${process.env.BASEAPIURL}`;

  public async getCohortMembers(cohortMembersId: any, request: any) {
    var axios = require("axios");

    var data = {
      query: `query GetCohortMembers($cohortMembersId:uuid!) {
        groupmembership_by_pk(cohortMembersId: $cohortMembersId) {
            created_at
            groupId
            cohortMembersId
            schoolId
            role
            updated_at
            userId
      }
    }`,
      variables: {
        cohortMembersId: cohortMembersId,
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

    let result = [response?.data?.data?.groupmembership_by_pk];
    let cohortMembersResponse = await this.mappedResponse(result);
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: cohortMembersResponse[0],
    });
  }

  public async createCohortMembers(
    request: any,
    cohortMembers: CohortMembersDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortMembers).forEach((e) => {
      if (cohortMembers[e] && cohortMembers[e] != "") {
        if (Array.isArray(cohortMembers[e])) {
          query += `${e}: ${JSON.stringify(cohortMembers[e])}, `;
        } else {
          query += `${e}: "${cohortMembers[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateCohortMembers {
        insert_groupmembership_one(object: {${query}}) {
         cohortMembersId
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

    const result = response.data.data.insert_groupmembership_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateCohortMembers(
    cohortMembersId: string,
    request: any,
    cohortMembersDto: CohortMembersDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortMembersDto).forEach((e) => {
      if (cohortMembersDto[e] && cohortMembersDto[e] != "") {
        if (Array.isArray(cohortMembersDto[e])) {
          query += `${e}: ${JSON.stringify(cohortMembersDto[e])}, `;
        } else {
          query += `${e}: ${cohortMembersDto[e]}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateCohortMembers($cohortMembersId:uuid) {
          update_groupmembership(where: { cohortMembersId: {_eq: $ cohortMembersId}}, _set: {${query}}) {
          affected_rows
        }
}`,
      variables: {
        cohortMembersId: cohortMembersId,
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

    const result = response.data.data;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchCohortMembers(
    request: any,
    cohortMembersSearchDto: CohortMembersSearchDto
  ) {
    var axios = require("axios");

    let offset = 0;
    if (cohortMembersSearchDto.page > 1) {
      offset =
        parseInt(cohortMembersSearchDto.limit) *
        (cohortMembersSearchDto.page - 1);
    }

    let filters = cohortMembersSearchDto.filters;

    Object.keys(cohortMembersSearchDto.filters).forEach((item) => {
      Object.keys(cohortMembersSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchCohortMembers($filters:groupmembership_bool_exp,$limit:Int, $offset:Int) {
       groupmembership_aggregate {
          aggregate {
            count
          }
        }
           groupmembership(where:$filters, limit: $limit, offset: $offset,) {
            created_at
            groupId
            cohortMembersId
            schoolId
            role
            updated_at
            userId
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
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    let result = response.data.data.groupmembership;
    let cohortMembersResponse = await this.mappedResponse(result);
    const count =
      response?.data?.data?.groupmembership_aggregate?.aggregate?.count;
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      totalCount: count,
      data: cohortMembersResponse,
    });
  }

  public async mappedResponse(result: any) {
    const cohortMembersResponse = result.map((obj: any) => {
      const cohortMembersMapping = {
        id: obj?.cohortMembersId ? `${obj.cohortMembersId}` : "",
        cohortMembersId: obj?.cohortMembersId
          ? `${obj.cohortMembersId}`
          : "",
        groupId: obj?.groupId ? `${obj.groupId}` : "",
        schoolId: obj?.schoolId ? `${obj.schoolId}` : "",
        userId: obj?.userId ? `${obj.userId}` : "",
        role: obj?.role ? `${obj.role}` : "",
        created_at: obj?.created_at ? `${obj.created_at}` : "",
        updated_at: obj?.updated_at ? `${obj.updated_at}` : "",
      };
      return new CohortMembersDto(cohortMembersMapping);
    });

    return cohortMembersResponse;
  }
}
