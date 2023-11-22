import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import jwt_decode from "jwt-decode";
import { SuccessResponse } from "src/success-response";
import { ALTLessonTrackingDto } from "src/lessonTracking/dto/altLessonTracking.dto";
import { UpdateALTLessonTrackingDto } from "src/lessonTracking/dto/updateAltLessonTracking.dto";
import { ALTLessonTrackingSearch } from "src/lessonTracking/dto/searchAltLessonTracking.dto";
import { ProgramService } from "src/program/altProgram.adapter";
import { ALTProgramAssociationService } from "src/program/altProgramAssociation.adapter";

import { ALTModuleTrackingService } from "src/module/altModuleTracking.adapter";
import { ErrorResponse } from "src/error-response";
import { TermsProgramtoRulesDto } from "src/program/TermsProgramtoRules.dto";
import { ModuleTrackingDto } from "src/module/moduleTracking.dto";
// import { HasuraUserService } from "./user.adapter";
import { UserAdapter } from "src/user/useradapter";

@Injectable()
export class ALTLessonTrackingService {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private programService: ProgramService,
    private altProgramAssociationService: ALTProgramAssociationService,
    private altModuleTrackingService: ALTModuleTrackingService,
    private hasuraUserService: UserAdapter
  ) {}

  public async mappedResponse(data: any) {
    const altLessonTrackingResponse = data.map((item: any) => {
      const altLessonMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        courseId: item?.courseId ? `${item.courseId}` : "",
        moduleId: item?.moduleId ? `${item.moduleId}` : "",
        lessonId: item?.lessonId ? `${item.lessonId}` : "",
        attempts: item?.attempts ? `${item.attempts}` : 0,
        score: item?.score ? `${item.score}` : 0,
        status: item?.status ? `${item.status}` : 0,
        scoreDetails: item?.scoreDetails ? `${item.scoreDetails}` : "",
        duration: item?.duration ? `${item.duration}` : "",
        contentType: item?.contentType ? `${item.contentType}` : "",
      };

      return new ALTLessonTrackingDto(altLessonMapping);
    });
    return altLessonTrackingResponse;
  }

  public async getExistingLessonTrackingRecords(
    request: any,
    lessonId: string,
    moduleId: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altLessonTrackingRecord = {
      query: `query GetLessonTrackingData ($userId:uuid!, $lessonId:String, $moduleId:String) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId}, moduleId: {_eq: $moduleId}}) {
            userId
            moduleId
            lessonId
            created_at
            createdBy
            status
            attempts
            duration
            contentType
        } }`,
      variables: {
        userId: altUserId,
        lessonId: lessonId,
        moduleId: moduleId,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonTrackingRecord,
    };

    const resLessonTracking = await this.axios(configData);

    if (resLessonTracking?.data?.errors) {
      return new ErrorResponse({
        errorCode: resLessonTracking.data.errors[0].extensions,
        errorMessage: resLessonTracking.data.errors[0].message,
      });
    }

    const result = resLessonTracking.data.data.LessonProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async getLastLessonTrackingRecord(
    request: any,
    lessonId: string,
    moduleId: string,
    attemptNumber: number
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altLastLessonTrackingRecord = {
      query: `query GetLastLessonTrackingRecord ($userId:uuid!, $lessonId:String, $moduleId:String, $attemptNumber: Int) {
          LessonProgressTracking(where: {userId: {_eq: $userId}, lessonId: {_eq: $lessonId}, moduleId: {_eq: $moduleId}, attempts: {_eq: $attemptNumber}}) {
            created_at
            createdBy
            status
            attempts
        } }`,
      variables: {
        userId: userId,
        lessonId: lessonId,
        moduleId: moduleId,
        attemptNumber: attemptNumber,
      },
    };

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLastLessonTrackingRecord,
    };

    const resLessonTracking = await this.axios(configData);

    if (resLessonTracking?.data?.errors) {
      throw {
        errorCode: resLessonTracking.data.errors[0].extensions,
        errorMessage: resLessonTracking.data.errors[0].message,
      };
    }

    return resLessonTracking.data.data.LessonProgressTracking;
  }

  public async getALTLessonTracking(
    request: any,
    altLessonId: string,
    userId?: string
  ) {
    // const decoded: any = jwt_decode(request.headers.authorization);

    // let altUserId: string;

    // if (userId) {
    //   const userRes: any = await this.hasuraUserService.getUser(
    //     userId,
    //     request
    //   );
    //   if (userRes.data.username) {
    //     altUserId = userId;
    //   } else {
    //     return new ErrorResponse({
    //       errorCode: "400",
    //       errorMessage: "Invalid User Id",
    //     });
    //   }
    // } else {
    //   // altUserId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    // }

    const ALTLessonTrackingData = {
      query: `
            query GetLessonTracking($altUserId: uuid!, $altLessonId: String) {
                LessonProgressTracking(where: {lessonId: {_eq: $altLessonId}, userId: {_eq: $altUserId}}) {
                  courseId
                  lessonId
                  moduleId
                  userId
                  attempts
                  status
                  score
                  duration
                  contentType
                  scoreDetails
                }
              }                 
            `,
      variables: {
        altLessonId: altLessonId,
        altUserId: userId,
      },
    };
console.log(ALTLessonTrackingData)
    const configData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        // Authorization: request.headers.authorization,
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,

        "Content-Type": "application/json",
      },
      data: ALTLessonTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.LessonProgressTracking;

    const data = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: data,
    });
  }

  public async checkAndAddALTLessonTracking(
    request: any,
    programId: string,
    subject: string,
    altLessonTrackingDto: ALTLessonTrackingDto
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    altLessonTrackingDto.userId =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    altLessonTrackingDto.createdBy = altLessonTrackingDto.userId;
    altLessonTrackingDto.updatedBy = altLessonTrackingDto.userId;

    let errorExRec = "";
    let recordList: any;
    recordList = await this.getExistingLessonTrackingRecords(
      request,
      altLessonTrackingDto.lessonId,
      altLessonTrackingDto.moduleId
    ).catch(function (error) {
      if (error?.response?.data) {
        errorExRec = error.response.data.errorMessage;
      } else {
        errorExRec = error + ", Can't fetch existing records.";
      }
    });

    if (!recordList?.data) {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: errorExRec,
      });
    }

    // rule is needed to check baseline assessment or course
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

    let programRules: any;

    if (progTermData?.data[0]?.rules) {
      programRules = JSON.parse(progTermData.data[0].rules);
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: "Program Rules not found for given subject!",
      });
    }

    let flag = false;
    let tracklessonModule;

    if (altLessonTrackingDto.userId) {
      for (const course of programRules?.prog) {
        if (course.contentId == altLessonTrackingDto.courseId) {
          flag = true;
          const numberOfRecords = parseInt(recordList?.data.length);
          const allowedAttempts = parseInt(course.allowedAttempts);
          if (course.contentType == "assessment" && allowedAttempts === 1) {
            if (numberOfRecords === 0) {
              altLessonTrackingDto.attempts = 1;
              return await this.createALTLessonTracking(
                request,
                altLessonTrackingDto
              );
            } else if (
              numberOfRecords === 1 &&
              recordList.data[0].status !== "completed"
            ) {
              return await this.updateALTLessonTracking(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto,
                0
              );
            } else if (
              numberOfRecords === 1 &&
              recordList.data[0].status === "completed"
            ) {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage: "Record for Assessment already exists!",
              });
            } else {
              return new ErrorResponse({
                errorCode: "400",
                errorMessage:
                  "Duplicate entry found in DataBase for Assessment",
              });
            }
          } else if (course.contentType == "course" && allowedAttempts === 0) {
            if (numberOfRecords === 0) {
              altLessonTrackingDto.attempts = 1;

              const lessonTrack: any = await this.createALTLessonTracking(
                request,
                altLessonTrackingDto
              );

              if (
                altLessonTrackingDto.status === "completed" &&
                lessonTrack?.statusCode === 200
              ) {
                tracklessonModule = await this.lessonToModuleTracking(
                  request,
                  altLessonTrackingDto,
                  programId,
                  subject
                );
              }

              return {
                lessonTrack: lessonTrack,
                tracking: tracklessonModule,
              };
            } else if (numberOfRecords >= 1) {
              const lastRecord = await this.getLastLessonTrackingRecord(
                request,
                altLessonTrackingDto.lessonId,
                altLessonTrackingDto.moduleId,
                numberOfRecords
              ).catch(function (error) {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: error,
                });
              });

              if (!lastRecord[0].status) {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage:
                    lastRecord +
                    "Duplicate entry found in DataBase for Baseline Assessment",
                });
              }

              if (lastRecord[0]?.status !== "completed") {
                const lessonTrack: any = await this.updateALTLessonTracking(
                  request,
                  altLessonTrackingDto.lessonId,
                  altLessonTrackingDto,
                  lastRecord[0]?.attempts
                );

                // Adding to module only when its first attempt and increasing count in module for lesson
                if (
                  altLessonTrackingDto.status === "completed" &&
                  lastRecord[0].attempts === 1 &&
                  lessonTrack?.statusCode === 200
                ) {
                  tracklessonModule = await this.lessonToModuleTracking(
                    request,
                    altLessonTrackingDto,
                    programId,
                    subject
                  );
                }

                return {
                  lessonTrack: lessonTrack,
                  tracking: tracklessonModule,
                };
              } else if (lastRecord[0]?.status === "completed") {
                altLessonTrackingDto.attempts = numberOfRecords + 1;
                const lessonTrack = await this.createALTLessonTracking(
                  request,
                  altLessonTrackingDto
                );
                return {
                  lessonTrack: lessonTrack,
                  tracking: "Multiple attempt for lesson added",
                };
              } else {
                return new ErrorResponse({
                  errorCode: "400",
                  errorMessage: lastRecord,
                });
              }
            }
          }
        }
      }
      if (!flag) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: `Course provided does not exist in the current program.`,
        });
      }
    }
  }
  public async createALTLessonTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto
  ) {
    // const decoded: any = jwt_decode(request.headers.authorization);
    // altLessonTrackingDto.userId =
    //   decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const altLessonTracking = new ALTLessonTrackingDto(altLessonTrackingDto);
    let newAltLessonTracking = "";
    Object.keys(altLessonTrackingDto).forEach((key) => {
      if (
        altLessonTrackingDto[key] &&
        altLessonTrackingDto[key] != "" &&
        Object.keys(altLessonTracking).includes(key)
      ) {
        if (key === "status") {
          newAltLessonTracking += `${key}: ${altLessonTrackingDto[key]},`;
        } else {
          newAltLessonTracking += `${key}: ${JSON.stringify(
            altLessonTrackingDto[key]
          )},`;
        }
      }
    });
console.log("abc")
    const altLessonTrackingData = {
      query: `mutation CreateALTLessonTracking {
            insert_LessonProgressTracking_one(object: {${newAltLessonTracking}}) {
                attempts
                status
                userId
                courseId
                lessonId
                moduleId
                lessonProgressId
                score
                duration
                contentType
                scoreDetails                
          }
        }`,
      variables: {},
      
    };
    console.log("altLessonTrackingData",altLessonTrackingData)

    const configDataforCreate = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        // Authorization: request.headers.authorization,
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
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

    const result = response.data.data.insert_LessonProgressTracking_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateALTLessonTracking(
    request: any,
    lessonId: string,
    updateAltLessonTrackDto: UpdateALTLessonTrackingDto,
    lastAttempt: number
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    const updateAltLessonTracking = new UpdateALTLessonTrackingDto(
      updateAltLessonTrackDto
    );
    let newUpdateAltLessonTracking = "";
    Object.keys(updateAltLessonTrackDto).forEach((key) => {
      if (
        updateAltLessonTrackDto[key] &&
        updateAltLessonTrackDto[key] != "" &&
        Object.keys(updateAltLessonTracking).includes(key)
      ) {
        if (key === "status") {
          newUpdateAltLessonTracking += `${key}: ${updateAltLessonTrackDto[key]},`;
        } else {
          newUpdateAltLessonTracking += `${key}: ${JSON.stringify(
            updateAltLessonTrackDto[key]
          )}, `;
        }
      }
    });

    let altLessonUpdateTrackingData = {};

    if (!lastAttempt) {
      altLessonUpdateTrackingData = {
        query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId}}, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
            }
        }`,
        variables: {
          userId: userId,
          lessonId: lessonId,
        },
      };
    } else {
      altLessonUpdateTrackingData = {
        query: `mutation updateAltLessonTracking ($userId:uuid!, $lessonId:String, $lastAttempt:Int) {
              update_LessonProgressTracking(where: {lessonId: {_eq: $lessonId}, userId: {_eq: $userId} ,attempts: {_eq: $lastAttempt}}, _set: {${newUpdateAltLessonTracking}}) {
              affected_rows
            }
        }`,
        variables: {
          userId: userId,
          lessonId: lessonId,
          lastAttempt: lastAttempt,
        },
      };
    }

    const configData = {
      method: "post",
      url: process.env.ALTHASURA,
      headers: {
        Authorization: request.headers.authorization,
        "Content-Type": "application/json",
      },
      data: altLessonUpdateTrackingData,
    };

    const response = await this.axios(configData);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response.data.errors[0].extensions,
        errorMessage: response.data.errors[0].message,
      });
    }

    const result = response.data.data.update_LessonProgressTracking;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async searchALTLessonTracking(
    request: any,
    userId: string,
    altLessonTrackingSearch: ALTLessonTrackingSearch
  ) {
    var axios = require("axios");

    // const decoded: any = jwt_decode(request.headers.authorization);
    // const altUserId =
    //   decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];

    altLessonTrackingSearch.filters.userId = userId;
    let query = "";
    Object.keys(altLessonTrackingSearch.filters).forEach((e) => {
      if (
        altLessonTrackingSearch.filters[e] &&
        altLessonTrackingSearch.filters[e] != ""
      ) {
        if (e === "status") {
          query += `${e}:{_eq: ${altLessonTrackingSearch.filters[e]}},`;
        } else {
          query += `${e}:{_eq:"${altLessonTrackingSearch.filters[e]}"}`;
        }
      }
    });

    var searchData = {
      query: `query SearchALTLessonTracking($limit:Int) {
        LessonProgressTracking(limit: $limit, where: {${query}}) {
          userId
          courseId
          lessonId
          moduleId
          status
          attempts
          score
          duration
          contentType
          scoreDetails
        }
    }`,
      variables: {
        limit: altLessonTrackingSearch.limit,
      },
    };
    const configData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        // Authorization: request.headers.authorization,
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET
        // "Content-Type": "application/json",
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

    let result = response.data.data.LessonProgressTracking;
    const altLessonTrackingList = await this.mappedResponse(result);

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: altLessonTrackingList,
    });
  }

  public async lessonToModuleTracking(
    request: any,
    altLessonTrackingDto: ALTLessonTrackingDto,
    programId: string,
    subject: string
  ) {
    const currentUrl = process.env.SUNBIRDURL;

    let config = {
      method: "get",
      url:
        currentUrl +
        `/api/course/v1/hierarchy/${altLessonTrackingDto.courseId}?orgdetails=orgName,email&licenseDetails=name,description,url`,
    };

    const courseHierarchy = await this.axios(config);
    const data = courseHierarchy?.data.result.content;
    let noOfModules = data.children.length;

    let currentModule = data.children.find((item) => {
      return item.identifier === altLessonTrackingDto.moduleId;
    });

    let altModuleTracking = {
      userId: altLessonTrackingDto.userId,
      courseId: altLessonTrackingDto.courseId,
      moduleId: altLessonTrackingDto.moduleId,
      status: "ongoing",
      totalNumberOfLessonsCompleted: 1,
      totalNumberOfLessons: currentModule.children.length,
      calculatedScore: 0,
      createdBy: altLessonTrackingDto.userId,
      updatedBy: altLessonTrackingDto.userId,
    };

    const altModuleTrackingDto = new ModuleTrackingDto(altModuleTracking);

    let moduleTracking: any;
    moduleTracking =
      await this.altModuleTrackingService.checkAndAddALTModuleTracking(
        request,
        programId,
        subject,
        noOfModules,
        altModuleTrackingDto
      );

    if (moduleTracking?.statusCode != 200) {
      return new ErrorResponse({
        errorCode: moduleTracking?.statusCode,
        errorMessage:
          moduleTracking?.errorMessage + "Could not create Module Tracking",
      });
    } else {
      if (moduleTracking.data.moduleProgressId) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking created" },
        });
      } else if (moduleTracking.data.affected_rows) {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Module and Course Tracking updated" },
        });
      } else {
        return new SuccessResponse({
          statusCode: moduleTracking?.statusCode,
          message: "Ok.",
          data: { ack: "Course completed" },
        });
      }
    }
  }
}
