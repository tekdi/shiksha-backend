import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ProgramDto } from "src/program/program.dto";
import { BMGStoProgramDto } from "src/program/bmgstoProgram.dto";
import { IProgramServicelocator } from "src/program/programservicelocator";
import { ErrorResponse } from "src/error-response";
// import { UpdateALTProgramDto } from "src/altProgram/dto/updateAltProgram.dto";
import { ALTProgramSearch } from "src/program/searchAltProgram.dto";
import { getUserRole } from "src/adapters/hasura/role.adapter";
import jwt_decode from "jwt-decode";

@Injectable()
export class ProgramService implements IProgramServicelocator {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

  public async mappedResponse(data: any) {
    const programResponse = data.map((item: any) => {
      const programMapping = {
        programName: item?.programName ? `${item.programName}` : "",
        startDate: item?.startDate ? `${item.startDate}` : "",
        endDate: item?.endDate ? `${item.endDate}` : "",
        board: item?.board ? `${item.board}` : "",
        medium: item?.medium ? `${item.medium}` : "",
        grade: item?.grade ? `${item.grade}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new ProgramDto(programMapping);
    });

    return programResponse;
  }

  public async getProgramDetailsById(request: any, programId: string) {
    const programData = {
      query: `query GetProgramDetailsById ($programId:uuid!) {
              AssessProgram_by_pk(programId:$programId) {
                programName
                startDate
                endDate
                board
                medium
                grade
                created_at
                updated_at
              }
            }`,
      variables: {
        programId: programId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = await this.mappedResponse([
      response.data.data.AssessProgram_by_pk,
    ]);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async getCurrentProgramId(
    request: any,
    bmgstoprogramdto: BMGStoProgramDto
  ) {
    const programData = {
      query: `query GetCurrentProgramId ($board:String,$medium:String,$grade:String,$currentDate:date){
            AssessProgram(where: 
            {
              board: {_eq: $board},
              medium: {_eq: $medium}
              grade: {_eq: $grade},
              endDate: {_gte: $currentDate},
              startDate: {_lte: $currentDate}
            }) 
            {
              programId
            }
          }`,
      variables: {
        board: bmgstoprogramdto.board,
        medium: bmgstoprogramdto.medium,
        grade: bmgstoprogramdto.grade,
        currentDate: bmgstoprogramdto.currentDate,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    let result = response.data.data.AssessProgram;

    if (!result.length) {
      result = `No matching record found for the current combination.`;
    }

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async createProgram(request: any, programdto: ProgramDto) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
    const programSchema = new ProgramDto(programdto);
    let newProgramData = "";
    Object.keys(programdto).forEach((key) => {
      if (
        programdto[key] &&
        programdto[key] != "" &&
        Object.keys(programSchema).includes(key)
      ) {
        newProgramData += `${key}: ${JSON.stringify(programdto[key])}, `;
      }
    });

    const programData = {
      query: `mutation CreateProgram {
              insert_AssessProgram_one(object: {${newProgramData}}) {
                  programId
            }
          }`,
      variables: {},
    };
    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),

        "Content-Type": "application/json",
      },
      data: programData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_AssessProgram_one;
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  // public async updateProgram(
  // request: any,
  //   programId: string,
  //   updateAltProgramDto: UpdateALTProgramDto
  // ) {
  //   const updateAltProgram = new UpdateALTProgramDto(updateAltProgramDto);

  //   console.log(updateAltProgram, "hmm");
  //   console.log(updateAltProgramDto);

  //   let newUpdateAltProgram = "";
  //   Object.keys(updateAltProgramDto).forEach((key) => {
  //     if (
  //       updateAltProgramDto[key] &&
  //       updateAltProgramDto[key] != "" &&
  //       Object.keys(updateAltProgram).includes(key)
  //     ) {
  //       newUpdateAltProgram += `${key}: ${JSON.stringify(
  //         updateAltProgramDto[key]
  //       )},`;
  //     }
  //   });

  //   console.log(programId);

  //   console.log(newUpdateAltProgram, "newUpdateAltProgram");

  //   const altProgramUpdateData = {
  //     query: `mutation UpdateProgram($programId:uuid!) {
  //       update_AssessProgram_by_pk(pk_columns: {programId: $programId}, _set: {${newUpdateAltProgram}}) {
  //         updated_at
  //       }
  //     }`,
  //     variables: {
  //       programId: programId,
  //     },
  //   };

  //   console.log(altProgramUpdateData);

  //   const configData = {
  //     method: "post",
  //     url: process.env.ALTHASURA,
  //     headers: {
  //       "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
  //       "Content-Type": "application/json",
  //     },
  //     altProgramUpdateData,
  //   };

  //   const response = await this.axios(configData);

  //   if (response?.data?.errors) {
  //     console.log(response?.data?.errors);

  //     return new ErrorResponse({
  //       errorCode: response.data.errors[0].extensions,
  //       errorMessage: response.data.errors[0].message,
  //     });
  //   }

  //   const result = response.data.data.AssessProgram_by_pk;

  //   return new SuccessResponse({
  //     statusCode: 200,
  //     message: "Ok.",
  //     data: result,
  //   });
  // }

  public async searchALTProgram(
    request: any,
    altProgramSearch: ALTProgramSearch
  ) {
    var axios = require("axios");
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    let query = "";
    Object.keys(altProgramSearch.filters).forEach((e) => {
      if (altProgramSearch.filters[e] && altProgramSearch.filters[e] != "") {
        if (e === "programName") {
          query += `${e}:{_ilike: "%${altProgramSearch.filters[e]}%"}`;
        } else {
          query += `${e}:{_eq:"${altProgramSearch.filters[e]}"}`;
        }
      }
    });
    var searchData = {
      query: `query SearchALTSchoolTracking($limit:Int) {
        AssessProgram(limit: $limit, where: {${query}}) {
          board
          grade
          medium
          programId
          programName
          startDate
          endDate
          created_at
          updated_at
        }
    }`,
      variables: {
        limit: altProgramSearch.limit,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),

        "Content-Type": "application/json",
      },
      data: searchData,
    };

    const response = await axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    let result = response.data.data.AssessProgram;
    const altProgramList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altProgramList,
    });
  }
}
