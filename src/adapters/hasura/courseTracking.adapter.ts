// import { Injectable } from "@nestjs/common";
// import { HttpService } from "@nestjs/axios";
// import { SuccessResponse } from "src/success-response";
// import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";

// @Injectable()
// export class CourseTrackingService {
//   constructor(private httpService: HttpService) {}
//   public async getCourseTracking(courseTrackingId: any, request: any) {
//     var axios = require("axios");

//     var data = {
//       query: `query GetCourseTracking($courseTrackingId:uuid) {
//       coursetracking(where: {courseTrackingId: {_eq: $courseTrackingId}}) {
//         contentIds
//         certificate
//         courseId
//         courseTrackingId
//         created_at
//         endTime
//         progressDetail
//         startTime
//         status
//         updated_at
//         userId
//         date
//         source
//       }
//     }`,
//       variables: {
//         courseTrackingId: courseTrackingId,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     let result = await this.mappedResponse(response.data.data.coursetracking);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: result,
//     });
//   }
//   public async createCourseTracking(
//     request: any,
//     progressDetail: string,
//     courseId: string,
//     userId: string,
//     contentIds: string,
//     startTime: string,
//     endTime: string,
//     certificate: string,
//     status: string,
//     source: string
//   ) {
//     var axios = require("axios");
//     var data = {
//       query: `mutation CreateCourseTracking($contentIds: jsonb, $certificate: String, $courseId:String, $startTime: String, $endTime: String, $progressDetail: String, $status: String, $userId: String,$source:String) {
//       insert_coursetracking_one(object:{contentIds: $contentIds, certificate: $certificate, courseId:$courseId, startTime: $startTime, endTime: $endTime, progressDetail: $progressDetail, status: $status, userId: $userId, source:$source}) {
//         courseTrackingId
//       }
//     }`,
//       variables: {
//         contentIds: contentIds,
//         certificate: certificate,
//         courseId: courseId,
//         endTime: endTime,
//         progressDetail: progressDetail,
//         startTime: startTime,
//         status: status,
//         userId: userId,
//         source: source,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: response.data,
//     });
//   }

//   public async updateCourseTracking(
//     request: any,
//     courseTrackingId: string,
//     progressDetail: string,
//     courseId: string,
//     userId: string,
//     contentIds: string,
//     startTime: string,
//     endTime: string,
//     certificate: string,
//     status: string,
//     source: string
//   ) {
//     var axios = require("axios");

//     const updateData = {
//       contentIds: contentIds,
//       certificate: certificate,
//       courseId: courseId,
//       endTime: endTime,
//       progressDetail: progressDetail,
//       startTime: startTime,
//       status: status,
//       userId: userId,
//       source: source,
//     };

//     let query = "";
//     Object.keys(updateData).forEach((e) => {
//       if (updateData[e] && updateData[e] != "") {
//         if (e != "contentIds") {
//           query += `${e}: "${updateData[e]}", `;
//         } else {
//           query += `${e}: ${updateData[e]}, `;
//         }
//       }
//     });

//     var data = {
//       query: `mutation CreateCourseTracking($courseTrackingId:uuid) {
//         update_coursetracking(where: {courseTrackingId: {_eq: $courseTrackingId}}, _set: {${query}}) {
//             affected_rows
//       }
//     }`,
//       variables: {
//         courseTrackingId: courseTrackingId,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: response.data,
//     });
//   }

//   public async searchCourseTracking(
//     limit: string,
//     courseId: string,
//     userId: string,
//     status: string,
//     page: number,
//     source: string,
//     request: any
//   ) {
//     var axios = require("axios");
//     let offset = 0;

//     if (page > 1) {
//       offset = parseInt(limit) * (page - 1);
//     }

//     const searchData = {
//       courseId,
//       userId,
//       status,
//       source,
//     };

//     let query = "";
//     Object.keys(searchData).forEach((e) => {
//       if (searchData[e] && searchData[e] != "") {
//         query += `${e}:{_eq:"${searchData[e]}"}`;
//       }
//     });

//     var data = {
//       query: `query searchCourseTracking($offset:Int,$limit:Int) {
//         coursetracking_aggregate {
//           aggregate {
//             count
//           }
//         }
//   coursetracking(limit: $limit, offset: $offset, where: {${query}}) {
//     contentIds
//     certificate
//     courseId
//     courseTrackingId
//     created_at
//     endTime
//     progressDetail
//     startTime
//     status
//     updated_at
//     userId
//     date
//     source
//   }
// }`,
//       variables: {
//         limit: parseInt(limit),
//         offset: offset,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);
//     let result = [];

//     if (response?.data?.data?.coursetracking) {
//       result = await this.mappedResponse(response.data.data.coursetracking);
//     }
//     const count =
//       response?.data?.data?.coursetracking_aggregate?.aggregate?.count;
//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       totalCount: count,
//       data: result,
//     });
//   }

//   public async mappedResponse(result: any) {
//     const courseResponse = result.map((obj: any) => {
//       const courseMapping = {
//         id: obj?.courseTrackingId ? `${obj.courseTrackingId}` : "",
//         courseTrackingId: obj?.courseTrackingId
//           ? `${obj.courseTrackingId}`
//           : "",
//         courseId: obj?.courseId ? `${obj.courseId}` : "",
//         userId: obj?.userId ? `${obj.userId}` : "",
//         progressDetail: obj?.progressDetail ? obj.progressDetail : "",
//         contentIds: obj?.contentIds ? obj.contentIds : [],
//         startTime: obj?.startTime ? `${obj.startTime}` : "",
//         endTime: obj?.endTime ? `${obj.endTime}` : "",
//         certificate: obj?.certificate ? `${obj.certificate}` : "",
//         status: obj?.status ? `${obj.status}` : "",
//         source: obj?.source ? `${obj.source}` : "",
//         date: obj?.date ? `${obj.date}` : "",
//         createdAt: obj?.created_at ? `${obj.created_at}` : "",
//         updatedAt: obj?.updated_at ? `${obj.updated_at}` : "",
//       };
//       return new CourseTrackingDto(courseMapping);
//     });

//     return courseResponse;
//   }
// }

// import { Injectable } from "@nestjs/common";
// import { HttpService } from "@nestjs/axios";
// import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";
// import jwt_decode from "jwt-decode";
// import { SuccessResponse } from "src/success-response";
// import { ErrorResponse } from "src/error-response";

import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";
import { UpdateALTCourseTrackingDto } from "src/courseTracking/dto/updateCourseTracking.dto";
import { ALTCourseTrackingSearch } from "src/courseTracking/dto/searchCourseTracking.dto";
import { ErrorResponse } from "src/error-response";
// import { HasuraUserService } from "src/user/useradapter";
// import { ALTHasuraUserService } from "src/adapters/hasura/altUser.adapter";

@Injectable()

// export class CourseTrackingService {
//   axios = require("axios");

//   constructor(private httpService: HttpService) {}
//   public async getCourseTracking(courseTrackingId: any, request: any) {
//     var axios = require("axios");

//     var data = {
//       query: `query GetCourseTracking($courseTrackingId:uuid) {
//       coursetracking(where: {courseTrackingId: {_eq: $courseTrackingId}}) {
//         contentIds
//         certificate
//         courseId
//         courseTrackingId
//         created_at
//         endTime
//         progressDetail
//         startTime
//         status
//         updated_at
//         userId
//         date
//         source
//       }
//     }`,
//       variables: {
//         courseTrackingId: courseTrackingId,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     let result = await this.mappedResponse(response.data.data.coursetracking);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: result,
//     });
//   }

//   // public async addALTCourseTracking(
//   //   request: any,
//   //   altCourseTrackingDto: CourseTrackingDto,
//   //   moduleStatus: string
//   // ) {
//   //   let errorExRec = "";
//   //   let recordList: any = {};
//   //   recordList = await this.getExistingCourseTrackingRecords(
//   //     request,
//   //     altCourseTrackingDto.courseId,
//   //     null
//   //   ).catch(function (error) {
//   //     errorExRec = error;
//   //   });

//   //   if (!recordList?.data) {
//   //     return new ErrorResponse({
//   //       errorCode: "400",
//   //       errorMessage: recordList?.errorMessage,
//   //     });
//   //   }

//   //   const numberOfRecords = parseInt(recordList?.data.length);

//   //   if (numberOfRecords === 0) {
//   //     if (
//   //       altCourseTrackingDto.totalNumberOfModulesCompleted + 1 ===
//   //       altCourseTrackingDto.totalNumberOfModules
//   //     ) {
//   //       altCourseTrackingDto.status = "completed";
//   //     } else if (moduleStatus === "completed") {
//   //       altCourseTrackingDto.status = "ongoing";
//   //     }
//   //     altCourseTrackingDto.totalNumberOfModulesCompleted =
//   //       altCourseTrackingDto.totalNumberOfModulesCompleted + 1;
//   //     return this.createALTCourseTracking(request, altCourseTrackingDto);
//   //   } else if (
//   //     numberOfRecords === 1 &&
//   //     recordList.data[0].status !== "completed"
//   //   ) {
//   //     if (
//   //       parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1 ===
//   //       parseInt(recordList.data[0].totalNumberOfModules)
//   //     ) {
//   //       altCourseTrackingDto.status = "completed";
//   //     } else {
//   //       altCourseTrackingDto.status = "ongoing";
//   //     }

//   //     if (moduleStatus === "completed") {
//   //       altCourseTrackingDto.totalNumberOfModulesCompleted =
//   //         parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1;
//   //     }

//   //     return await this.updateALTCourseTracking(request, altCourseTrackingDto);
//   //   } else if (numberOfRecords > 1) {
//   //     return new ErrorResponse({
//   //       errorCode: "400",
//   //       errorMessage: "Duplicate entry found in DataBase for Course",
//   //     });
//   //   } else if (recordList.data[0].status === "completed") {
//   //     return new SuccessResponse({
//   //       statusCode: 200,
//   //       message: "Course is completed.",
//   //     });
//   //   }
//   // }

//   // public async getExistingCourseTrackingRecords(
//   //   request: any,
//   //   altCourseId: string,
//   //   userId?: string
//   // ) {
//   //   const decoded: any = jwt_decode(request.headers.authorization);

//   //   let altUserId: string;

//   //   if (userId) {
//   //     const userRes: any = await this.hasuraUserService.getUser(
//   //       userId,
//   //       request
//   //     );
//   //     if (userRes.data.username) {
//   //       altUserId = userId;
//   //     } else {
//   //       return new ErrorResponse({
//   //         errorCode: "400",
//   //         errorMessage: "Invalid User Id",
//   //       });
//   //     }
//   //   } else {
//   //     const decoded: any = jwt_decode(request.headers.authorization);
//   //     altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
//   //   }

//   //   const ALTCourseTrackingData = {
//   //     query: `
//   //           query MyQuery($altUserId: uuid!, $altCourseId: String) {
//   //               CourseProgressTracking(where: {courseId: {_eq: $altCourseId}, userId: {_eq: $altUserId}}) {
//   //                 courseId
//   //                 userId
//   //                 totalNumberOfModulesCompleted
//   //                 totalNumberOfModules
//   //                 calculatedScore
//   //                 status
//   //                 created_at
//   //                 updated_at
//   //                 createdBy
//   //                 updatedBy
//   //               }
//   //             }                 
//   //           `,
//   //     variables: {
//   //       altCourseId: altCourseId,
//   //       altUserId: altUserId,
//   //     },
//   //   };

//   //   const configData = {
//   //     method: "post",
//   //     url: process.env.ALTHASURA,
//   //     headers: {
//   //       "Authorization": request.headers.authorization,
//   //       "Content-Type": "application/json",
//   //     },
//   //     data: ALTCourseTrackingData,
//   //   };

//   //   const response = await this.axios(configData);

//   //   if (response?.data?.errors) {
//   //     return new ErrorResponse({
//   //       errorCode: response.data.errors[0].extensions,
//   //       errorMessage: response.data.errors[0].message,
//   //     });
//   //   }

//   //   const result = response.data.data.CourseProgressTracking;

//   //   const data = await this.mappedResponse(result);

//   //   return new SuccessResponse({
//   //     statusCode: 200,
//   //     message: "Ok.",
//   //     data: data,
//   //   });
//   // }

//   // public async createALTCourseTracking(
//   //   request: any,
//   //   altCourseTrackingDto: CourseTrackingDto
//   // ) {
//   //   const decoded: any = jwt_decode(request.headers.authorization);
//   //   altCourseTrackingDto.userId =
//   //     decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

//   //   const altCourseTracking = new ALTCourseTrackingDto(altCourseTrackingDto);
//   //   let newAltCourseTracking = "";
//   //   Object.keys(altCourseTrackingDto).forEach((key) => {
//   //     if (
//   //       altCourseTrackingDto[key] &&
//   //       altCourseTrackingDto[key] != "" &&
//   //       Object.keys(altCourseTracking).includes(key)
//   //     ) {
//   //       if (key === "status") {
//   //         newAltCourseTracking += `${key}: ${altCourseTrackingDto[key]},`;
//   //       } else {
//   //         newAltCourseTracking += `${key}: ${JSON.stringify(
//   //           altCourseTrackingDto[key]
//   //         )}, `;
//   //       }
//   //     }
//   //   });

//   //   const altCourseTrackingData = {
//   //     query: `mutation CreateALTProgressTracking {
//   //           insert_CourseProgressTracking_one(object: {${newAltCourseTracking}}) {
//   //             courseProgressId
//   //             courseId
//   //             userId
//   //             calculatedScore
//   //             status
//   //             created_at
//   //             updated_at
//   //             createdBy
//   //             updatedBy
//   //         }
//   //       }`,
//   //     variables: {},
//   //   };

//   //   const configData = {
//   //     method: "post",
//   //     url: process.env.ALTHASURA,
//   //     headers: {
//   //       "Authorization": request.headers.authorization,
//   //       "Content-Type": "application/json",
//   //     },
//   //     data: altCourseTrackingData,
//   //   };

//   //   const response = await this.axios(configData);

//   //   if (response?.data?.errors) {
//   //     return new ErrorResponse({
//   //       errorCode: response.data.errors[0].extensions,
//   //       errorMessage: response.data.errors[0].message,
//   //     });
//   //   }

//   //   const result = response.data.data.insert_CourseProgressTracking_one;

//   //   return new SuccessResponse({
//   //     statusCode: 200,
//   //     message: "Ok.",
//   //     data: result,
//   //   });
//   // }
//   public async createCourseTracking(
//     request: any,
//     progressDetail: string,
//     courseId: string,
//     userId: string,
//     contentIds: string,
//     startTime: string,
//     endTime: string,
//     certificate: string,
//     status: string,
//     source: string
//   ) {
//     var axios = require("axios");
//     var data = {
//       query: `mutation CreateCourseTracking($contentIds: jsonb, $certificate: String, $courseId:String, $startTime: String, $endTime: String, $progressDetail: String, $status: String, $userId: String,$source:String) {
//       insert_coursetracking_one(object:{contentIds: $contentIds, certificate: $certificate, courseId:$courseId, startTime: $startTime, endTime: $endTime, progressDetail: $progressDetail, status: $status, userId: $userId, source:$source}) {
//         courseTrackingId
//       }
//     }`,
//       variables: {
//         contentIds: contentIds,
//         certificate: certificate,
//         courseId: courseId,
//         endTime: endTime,
//         progressDetail: progressDetail,
//         startTime: startTime,
//         status: status,
//         userId: userId,
//         source: source,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: response.data,
//     });
//   }

//   public async updateCourseTracking(
//     request: any,
//     courseTrackingId: string,
//     progressDetail: string,
//     courseId: string,
//     userId: string,
//     contentIds: string,
//     startTime: string,
//     endTime: string,
//     certificate: string,
//     status: string,
//     source: string
//   ) {
//     var axios = require("axios");

//     const updateData = {
//       contentIds: contentIds,
//       certificate: certificate,
//       courseId: courseId,
//       endTime: endTime,
//       progressDetail: progressDetail,
//       startTime: startTime,
//       status: status,
//       userId: userId,
//       source: source,
//     };

//     let query = "";
//     Object.keys(updateData).forEach((e) => {
//       if (updateData[e] && updateData[e] != "") {
//         if (e != "contentIds") {
//           query += `${e}: "${updateData[e]}", `;
//         } else {
//           query += `${e}: ${updateData[e]}, `;
//         }
//       }
//     });

//     var data = {
//       query: `mutation CreateCourseTracking($courseTrackingId:uuid) {
//         update_coursetracking(where: {courseTrackingId: {_eq: $courseTrackingId}}, _set: {${query}}) {
//             affected_rows
//       }
//     }`,
//       variables: {
//         courseTrackingId: courseTrackingId,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);

//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       data: response.data,
//     });
//   }

//   public async searchCourseTracking(
//     limit: string,
//     courseId: string,
//     userId: string,
//     status: string,
//     page: number,
//     source: string,
//     request: any
//   ) {
//     var axios = require("axios");
//     let offset = 0;

//     if (page > 1) {
//       offset = parseInt(limit) * (page - 1);
//     }

//     const searchData = {
//       courseId,
//       userId,
//       status,
//       source,
//     };

//     let query = "";
//     Object.keys(searchData).forEach((e) => {
//       if (searchData[e] && searchData[e] != "") {
//         query += `${e}:{_eq:"${searchData[e]}"}`;
//       }
//     });

//     var data = {
//       query: `query searchCourseTracking($offset:Int,$limit:Int) {
//         coursetracking_aggregate {
//           aggregate {
//             count
//           }
//         }
//   coursetracking(limit: $limit, offset: $offset, where: {${query}}) {
//     contentIds
//     certificate
//     courseId
//     courseTrackingId
//     created_at
//     endTime
//     progressDetail
//     startTime
//     status
//     updated_at
//     userId
//     date
//     source
//   }
// }`,
//       variables: {
//         limit: parseInt(limit),
//         offset: offset,
//       },
//     };

//     var config = {
//       method: "post",
//       url: process.env.REGISTRYHASURA,
//       headers: {
//         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     const response = await axios(config);
//     let result = [];

//     if (response?.data?.data?.coursetracking) {
//       result = await this.mappedResponse(response.data.data.coursetracking);
//     }
//     const count =
//       response?.data?.data?.coursetracking_aggregate?.aggregate?.count;
//     return new SuccessResponse({
//       statusCode: 200,
//       message: "Ok.",
//       totalCount: count,
//       data: result,
//     });
//   }

//   public async mappedResponse(result: any) {
//     const courseResponse = result.map((obj: any) => {
//       const courseMapping = {
//         id: obj?.courseTrackingId ? `${obj.courseTrackingId}` : "",
//         courseTrackingId: obj?.courseTrackingId
//           ? `${obj.courseTrackingId}`
//           : "",
//         courseId: obj?.courseId ? `${obj.courseId}` : "",
//         userId: obj?.userId ? `${obj.userId}` : "",
//         progressDetail: obj?.progressDetail ? obj.progressDetail : "",
//         contentIds: obj?.contentIds ? obj.contentIds : [],
//         startTime: obj?.startTime ? `${obj.startTime}` : "",
//         endTime: obj?.endTime ? `${obj.endTime}` : "",
//         certificate: obj?.certificate ? `${obj.certificate}` : "",
//         status: obj?.status ? `${obj.status}` : "",
//         source: obj?.source ? `${obj.source}` : "",
//         date: obj?.date ? `${obj.date}` : "",
//         createdAt: obj?.created_at ? `${obj.created_at}` : "",
//         updatedAt: obj?.updated_at ? `${obj.updated_at}` : "",
//       };
//       return new CourseTrackingDto(courseMapping);
//     });

//     return courseResponse;
//   }
// }


export class CourseTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    // private hasuraUserService: ALTHasuraUserService,
    
  ) {}

  public async mappedResponse(data: any) {
    const altCourseTrackingResponse = data.map((item: any) => {
      const altCourseMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        totalNumberOfModulesCompleted: item?.totalNumberOfModulesCompleted
          ? `${item.totalNumberOfModulesCompleted}`
          : 0,
        totalNumberOfModules: item?.totalNumberOfModules
          ? `${item.totalNumberOfModules}`
          : 0,
        calculatedScore: item?.calculatedScore ? `${item.calculatedScore}` : 0,
        status: item?.status ? `${item.status}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        createdAt: item?.created_at ? `${item.created_at}` : "",
        updatedAt: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new CourseTrackingDto(altCourseMapping);
    });

    return altCourseTrackingResponse;
  }

  public async getExistingCourseTrackingRecords(
    request: any,
    altCourseId: string,
    userId?: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);

    let altUserId: string;

    // if (userId) {
    //   const userRes: any = await this.hasuraUserService.getUser(
    //     userId,
    //     request
    //   )
    //   if (userRes.data.username) {
    //     altUserId = userId;
    //   } else {
    //     return new ErrorResponse({
    //       errorCode: "400",
    //       errorMessage: "Invalid User Id",
    //     });
    //   }
    // } else {
    //   const decoded: any = jwt_decode(request.headers.authorization);
    //   altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    // }

    const ALTCourseTrackingData = {
      query: `
            query MyQuery($altUserId: uuid!, $altCourseId: String) {
                CourseProgressTracking(where: {courseId: {_eq: $altCourseId}, userId: {_eq: $altUserId}}) {
                  courseId
                  userId
                  totalNumberOfModulesCompleted
                  totalNumberOfModules
                  calculatedScore
                  status
                  created_at
                  updated_at
                  createdBy
                  updatedBy
                }
              }                 
            `,
      variables: {
        altCourseId: altCourseId,
        altUserId: altUserId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: ALTCourseTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.CourseProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async createALTCourseTracking(
    request: any,
    altCourseTrackingDto: CourseTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    altCourseTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altCourseTracking = new CourseTrackingDto(altCourseTrackingDto);
    let newAltCourseTracking = "";
    Object.keys(altCourseTrackingDto).forEach((key) => {
      if (
        altCourseTrackingDto[key] &&
        altCourseTrackingDto[key] != "" &&
        Object.keys(altCourseTracking).includes(key)
      ) {
        if (key === "status") {
          newAltCourseTracking += `${key}: ${altCourseTrackingDto[key]},`;
        } else {
          newAltCourseTracking += `${key}: ${JSON.stringify(
            altCourseTrackingDto[key]
          )}, `;
        }
      }
    });

    const altCourseTrackingData = {
      query: `mutation CreateALTProgressTracking {
            insert_CourseProgressTracking_one(object: {${newAltCourseTracking}}) {
              courseProgressId
              courseId
              userId
              calculatedScore
              status
              created_at
              updated_at
              createdBy
              updatedBy
          }
        }`,
      variables: {},
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altCourseTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_CourseProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTCourseTracking(
    request: any,
    updateCourseTrackingDto: UpdateALTCourseTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    updateCourseTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const updateAltCourseTracking = new UpdateALTCourseTrackingDto(
      updateCourseTrackingDto
    );
    let newUpdateAltCourseTracking = "";
    Object.keys(updateCourseTrackingDto).forEach((key) => {
      if (
        updateCourseTrackingDto[key] &&
        updateCourseTrackingDto[key] != "" &&
        Object.keys(updateAltCourseTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltCourseTracking += `${key}: ${updateCourseTrackingDto[key]},`;
        } else {
          newUpdateAltCourseTracking += `${key}: ${JSON.stringify(
            updateCourseTrackingDto[key]
          )}, `;
        }
      }
    });

    const altCourseUpdateTrackingQuery = {
      query: `mutation updateAltCourseTracking ($userId:uuid! , $courseId:String) {
          update_CourseProgressTracking(where: {courseId: {_eq: $courseId}, userId: {_eq: $userId}}, _set: {${newUpdateAltCourseTracking}}) {
            affected_rows
          }
      }`,
      variables: {
        userId: updateAltCourseTracking.userId,
        courseId: updateAltCourseTracking.courseId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altCourseUpdateTrackingQuery,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_CourseProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTCourseTracking(
    request: any,
    userId: string,
    altCourseTrackingSearch: ALTCourseTrackingSearch
  ) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    altCourseTrackingSearch.filters.userId = userId;

    let query = "";
    Object.keys(altCourseTrackingSearch.filters).forEach((e) => {
      if (
        altCourseTrackingSearch.filters[e] &&
        altCourseTrackingSearch.filters[e] != ""
      ) {
        if (e === "status") {
          query += `${e}:{_eq: ${altCourseTrackingSearch.filters[e]}},`;
        } else {
          query += `${e}:{_eq:"${altCourseTrackingSearch.filters[e]}"}`;
        }
      }
    });

    var searchData = {
      query: `query SearchALTCourseTracking($limit:Int) {
        CourseProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          status
          calculatedScore
          status
          created_at
          updated_at
          createdBy
          updatedBy
        }
    }`,
      variables: {
        limit: altCourseTrackingSearch.limit,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
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

    let result = response.data.data.CourseProgressTracking;
    const altCourseTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altCourseTrackingList,
    });
  }

  public async addALTCourseTracking(
    request: any,
    altCourseTrackingDto: CourseTrackingDto,
    moduleStatus: string
  ) {
    let errorExRec = "";
    let recordList: any = {};
    recordList = await this.getExistingCourseTrackingRecords(
      request,
      altCourseTrackingDto.courseId,
      null
    ).catch(function (error) {
      errorExRec = error;
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: recordList?.errorMessage,
      });
    }

    const numberOfRecords = parseInt(recordList?.data.length);

    if (numberOfRecords === 0) {
      if (
        altCourseTrackingDto.totalNumberOfModulesCompleted + 1 ===
        altCourseTrackingDto.totalNumberOfModules
      ) {
        altCourseTrackingDto.status = "completed";
      } else if (moduleStatus === "completed") {
        altCourseTrackingDto.status = "ongoing";
      }
      altCourseTrackingDto.totalNumberOfModulesCompleted =
        altCourseTrackingDto.totalNumberOfModulesCompleted + 1;
      return this.createALTCourseTracking(request, altCourseTrackingDto);
    } else if (
      numberOfRecords === 1 &&
      recordList.data[0].status !== "completed"
    ) {
      if (
        parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1 ===
        parseInt(recordList.data[0].totalNumberOfModules)
      ) {
        altCourseTrackingDto.status = "completed";
      } else {
        altCourseTrackingDto.status = "ongoing";
      }

      if (moduleStatus === "completed") {
        altCourseTrackingDto.totalNumberOfModulesCompleted =
          parseInt(recordList.data[0].totalNumberOfModulesCompleted) + 1;
      }

      // return await this.updateALTCourseTracking(request, altCourseTrackingDto);
    } else if (numberOfRecords > 1) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Duplicate entry found in DataBase for Course",
      });
    } else if (recordList.data[0].status === "completed") {
      return new SuccessResponse({
        statusCode: 200,
        message: "Course is completed.",
      });
    }
  }

  public async getOngoingCourses(request: any, courseIdList: string[]) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const ALTCourseTrackingData = {
      query: `
              query MyQuery($altUserId: uuid!, $altCourseIdList: [String!]) {
                  CourseProgressTracking(where: {courseId: {_in: $altCourseIdList}, userId: {_eq: $altUserId}, status: {_eq: ongoing}}) {
                    userId
                    courseId
                    status
                    totalNumberOfModulesCompleted
                    totalNumberOfModules
                    calculatedScore
                    status
                    createdBy
                    updatedBy
                    created_at
                    updated_at
                  }
                }                 
              `,
      variables: {
        altCourseIdList: courseIdList,
        altUserId: altUserId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
          "Authorization": request.headers.authorization,
          "Content-Type": "application/json",
        },
        data: ALTCourseTrackingData,
      };
  
      const response = await this.axios(configData);
  
      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
  
      const result = response.data.data.CourseProgressTracking;
  
      const data = await this.mappedResponse(result);
  
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: data,
      });
  }
}

