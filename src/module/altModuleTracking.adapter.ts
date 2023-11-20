import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
import { ProgramService } from "src/program/altProgram.adapter";
import { ALTProgramAssociationService } from "src/program/altProgramAssociation.adapter";
import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";
import { ModuleTrackingDto } from "src/module/moduleTracking.dto";
import { TermsProgramtoRulesDto } from "src/program/TermsProgramtoRules.dto";
import { UpdateALTModuleTrackingDto } from "src/module/updateAltModuleTracking.dto";
import { ALTModuleTrackingSearch } from "src/module/searchAltModuleTracking.dto";
import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";

@Injectable()
export class ALTModuleTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService,
    private altCourseTrackingService: CourseTrackingService
  ) {}

  public async mappedResponse(data: any) {
    const altModuleTrackingResponse = data.map((item: any) => {
      const altModuleMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        moduleId: item?.moduleId ? `${item.moduleId}` : "",
        calculatedScore: item?.calculatedScore ? `${item.calculatedScore}` : 0,
        status: item?.status ? `${item.status}` : "",
        totalNumberOfLessonsCompleted: item?.totalNumberOfLessonsCompleted
          ? `${item.totalNumberOfLessonsCompleted}`
          : 0,
        totalNumberOfLessons: item?.totalNumberOfLessons
          ? `${item.totalNumberOfLessons}`
          : 0,
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
        created_at: item?.created_at ? `${item.created_at}` : "",
        updated_at: item?.updated_at ? `${item.updated_at}` : "",
      };

      return new ModuleTrackingDto(altModuleMapping);
    });
    return altModuleTrackingResponse;
  }

  public async getExistingModuleTrackingRecords(
    request: any,
    moduleId: string,
    courseId: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altModuleTrackingRecord = {
      query: `query GetModuleTrackingData ($userId:uuid!, $moduleId:String, $courseId:String) {
          ModuleProgressTracking(where: {userId: {_eq: $userId}, moduleId: {_eq: $moduleId}, courseId: {_eq: $courseId}}) {
            userId
            moduleId
            courseId
            status
            calculatedScore
            totalNumberOfLessonsCompleted
            totalNumberOfLessons
            created_at
            updated_at
            createdBy
            updatedBy
        } }`,
      variables: {
        userId: altUserId,
        moduleId: moduleId,
        courseId: courseId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altModuleTrackingRecord,
    };

    const resModuleTracking = await this.axios(configData);

    if (resModuleTracking?.data?.errors) {
      return new ErrorResponse({
        errorCode: resModuleTracking.data.errors[0].extensions,
        errorMessage: resModuleTracking.data.errors[0].message,
      });
    }

    const data = resModuleTracking.data.data.ModuleProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async getALTModuleTracking(request: any, altModuleId: string) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const ALTModuleTrackingData = {
      query: `
            query GetModuleTracking($altUserId: uuid!, $altModuleId: String) {
                ModuleProgressTracking(where: {moduleId: {_eq: $altModuleId}, userId: {_eq: $altUserId}}) {
                  courseId
                  moduleId
                  userId
                  status
                  calculatedScore
                  totalNumberOfLessonsCompleted
                  totalNumberOfLessons
                  created_at
                  updated_at
                  createdBy
                  updatedBy
                }
              }                 
            `,
      variables: {
        altModuleId: altModuleId,
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
      data: ALTModuleTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.ModuleProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async checkAndAddALTModuleTracking(
    request: any,
    programId: string,
    subject: string,
    noOfModules: number,
    altModuleTrackingDto: ModuleTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    altModuleTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    let errorExRec = "";

    // userId=""
    let recordList: any = {};
    recordList = await this.getExistingModuleTrackingRecords(
      request,
      altModuleTrackingDto.moduleId,
      altModuleTrackingDto.courseId
    ).catch(function (error) {
      errorExRec = error;
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: recordList?.errorMessage,
      });
    }

    let currentProgramDetails: any = {};
    currentProgramDetails = await this.programService.getProgramDetailsById(
      request,
      programId
    );

    if (!currentProgramDetails.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: currentProgramDetails?.errorMessage,
      });
    }

    const paramData = new TermsProgramtoRulesDto(currentProgramDetails.data);

    let progTermData: any = {};
    progTermData = await this.altProgramAssociationService.getRules(request, {
      programId: programId,
      board: paramData[0].board,
      medium: paramData[0].medium,
      grade: paramData[0].grade,
      subject: subject,
    });

    const programRules = JSON.parse(progTermData.data[0].rules);

    let flag = false;
    let courseAck: any;

    if (altModuleTrackingDto.userId) {
      for (const course of programRules?.prog) {
        if (course.contentId == altModuleTrackingDto.courseId) {
          flag = true;
          const numberOfRecords = parseInt(recordList?.data.length);

          if (numberOfRecords === 0) {
            if (
              altModuleTrackingDto.totalNumberOfLessons ===
              altModuleTrackingDto.totalNumberOfLessonsCompleted
            ) {
              altModuleTrackingDto.status = "completed";
            } else {
              altModuleTrackingDto.status = "ongoing";
            }
            courseAck = await this.moduleToCourseTracking(
              request,
              altModuleTrackingDto,
              noOfModules
            );
            if (courseAck.statusCode != 200) {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage: courseAck.errorMessage,
              });
            } else {
              return await this.createALTModuleTracking(
                request,
                altModuleTrackingDto
              );
            }
          } else if (
            numberOfRecords === 1 &&
            recordList.data[0].status !== "completed"
          ) {
            if (
              parseInt(recordList.data[0].totalNumberOfLessonsCompleted) + 1 ===
              parseInt(recordList.data[0].totalNumberOfLessons)
            ) {
              altModuleTrackingDto.status = "completed";
            }
            altModuleTrackingDto.totalNumberOfLessonsCompleted =
              recordList.data[0].totalNumberOfLessonsCompleted + 1;

            if (altModuleTrackingDto.status === "completed") {
              courseAck = await this.moduleToCourseTracking(
                request,
                altModuleTrackingDto,
                noOfModules
              );

              if (courseAck.statusCode != 200) {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: courseAck.errorMessage,
                });
              }
            }
            return await this.updateALTModuleTracking(
              request,
              altModuleTrackingDto.moduleId,
              altModuleTrackingDto.courseId,
              altModuleTrackingDto
            );
          } else if (
            numberOfRecords === 1 &&
            recordList.data[0].status === "completed"
          ) {
            console.log("recal scorehere");
          } else {
            return new ErrorResponse({
              errorCode: "400",
              errorMessage:
                "Duplicate entry found in DataBase for Course Module",
            });
          }
        }
      }
    }
  }

  public async createALTModuleTracking(
    request: any,
    altModuleTrackingDto: ModuleTrackingDto
  ) {
    const altModuleTracking = new ModuleTrackingDto(altModuleTrackingDto);
    let newAltModuleTracking = "";
    Object.keys(altModuleTrackingDto).forEach((key) => {
      if (
        altModuleTrackingDto[key] &&
        altModuleTrackingDto[key] != "" &&
        Object.keys(altModuleTracking).includes(key)
      ) {
        if (key === "status") {
          newAltModuleTracking += `${key}: ${altModuleTrackingDto[key]},`;
        } else {
          newAltModuleTracking += `${key}: ${JSON.stringify(
            altModuleTrackingDto[key]
          )},`;
        }
      }
    });

    const altLessonTrackingData = {
      query: `mutation CreateALTLessonTracking {
            insert_ModuleProgressTracking_one(object: {${newAltModuleTracking}}) {
                status
                userId
                courseId
                moduleId
                moduleProgressId
                calculatedScore
                totalNumberOfLessonsCompleted
                totalNumberOfLessons
                createdBy
                created_at                
          }
        }`,
      variables: {},
    };

    const configDataforCreate = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonTrackingData,
    };

    const response = await this.axios(configDataforCreate);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.insert_ModuleProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTModuleTracking(
    request: any,
    moduleId: string,
    courseId: string,
    updateAltModuleTrackDto: UpdateALTModuleTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const updateAltModuleTracking = new UpdateALTModuleTrackingDto(
      updateAltModuleTrackDto
    );
    let newUpdateAltModuleTracking = "";
    Object.keys(updateAltModuleTrackDto).forEach((key) => {
      if (
        updateAltModuleTrackDto[key] &&
        updateAltModuleTrackDto[key] != "" &&
        Object.keys(updateAltModuleTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltModuleTracking += `${key}: ${updateAltModuleTrackDto[key]},`;
        } else {
          newUpdateAltModuleTracking += `${key}: ${JSON.stringify(
            updateAltModuleTrackDto[key]
          )},`;
        }
      }
    });

    let altModuleUpdateTrackingData = {};

    altModuleUpdateTrackingData = {
      query: `mutation updateAltModuleTracking ($userId:uuid!, $moduleId:String, $courseId:String) {
              update_ModuleProgressTracking(where: {courseId: {_eq: $courseId}, userId: {_eq: $userId} ,moduleId: {_eq: $moduleId}}, _set: {${newUpdateAltModuleTracking}}) {
              affected_rows
            }
        }`,
      variables: {
        userId: altUserId,
        moduleId: moduleId,
        courseId: courseId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        "Authorization": request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altModuleUpdateTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_ModuleProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTModuleTracking(
    request: any,
    userId: string,
    altModuleTrackingSearch: ALTModuleTrackingSearch
  ) {
    var axios = require("axios");

    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    altModuleTrackingSearch.filters.userId = userId;
    let query = "";
    Object.keys(altModuleTrackingSearch.filters).forEach((e) => {
      if (
        altModuleTrackingSearch.filters[e] &&
        altModuleTrackingSearch.filters[e] != ""
      ) {
        if (e === "status") {
          query += `${e}:{_eq: ${altModuleTrackingSearch.filters[e]}},`;
        } else {
          query += `${e}:{_eq:"${altModuleTrackingSearch.filters[e]}"}`;
        }
      }
    });

    var searchData = {
      query: `query SearchALTModuleTracking($limit:Int) {
        ModuleProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          moduleId
          status
          calculatedScore
          totalNumberOfLessonsCompleted
          totalNumberOfLessons
          created_at
          updated_at
          createdBy
          updatedBy
        }
    }`,
      variables: {
        limit: altModuleTrackingSearch.limit,
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

    let result = response.data.data.ModuleProgressTracking;
    const altModuleTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altModuleTrackingList,
    });
  }

  public async moduleToCourseTracking(
    request: any,
    altModuleTrackingDto: ModuleTrackingDto,
    tnoOfModules: number
  ) {
    let altCourseTracking = {
      userId: altModuleTrackingDto.userId,
      courseId: altModuleTrackingDto.courseId,
      totalNumberOfModulesCompleted: 0,
      totalNumberOfModules: tnoOfModules,
      calculatedScore: 0,
      status: altModuleTrackingDto.status,
      createdBy: altModuleTrackingDto.createdBy,
      updatedBy: altModuleTrackingDto.updatedBy,
    };

    const altCourseTrackingDto = new CourseTrackingDto(altCourseTracking);

    let courseTracking: any;
    // courseTracking = await this.altCourseTrackingService.addALTCourseTracking(
    //   request,
    //   altCourseTrackingDto,
    //   altModuleTrackingDto.status
    // );

    if (courseTracking?.statusCode != 200) {
      return new ErrorResponse({
        errorCode: courseTracking?.statusCode,
        errorMessage: "Error in creating Course Tracking",
      });
    } else {
      if (courseTracking?.data?.courseProgressId) {
        return new SuccessResponse({
          statusCode: courseTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Course Tracking created" },
        });
      } else {
        return new SuccessResponse({
          statusCode: courseTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Course Tracking updated" },
        });
      }
    }
  }
}
