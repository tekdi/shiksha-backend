import { Injectable, HttpException } from "@nestjs/common";
import { CohortInterface } from "../../cohort/interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { first, map, Observable } from "rxjs";
import { response } from "express";
import { SuccessResponse } from "src/success-response";
const resolvePath = require("object-resolve-path");
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { catchError } from "rxjs/operators";
import { ErrorResponse } from "src/error-response";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { IServicelocatorcohort } from "../cohortservicelocator";
import { StudentDto } from "src/student/dto/student.dto";
import { UserDto } from "src/user/dto/user.dto";
export const SunbirdCohortToken = "SunbirdCohort";
@Injectable()
export class SunbirdCohortService implements IServicelocatorcohort {
  private cohort: CohortInterface;

  constructor(private httpService: HttpService) {}

  url = `${process.env.BASEAPIURL}`;

  public async getCohort(cohortId: any, request: any) {
    return this.httpService
      .get(`${this.url}/Class/${cohortId}`, {
        headers: {
          Authorization: request.headers.authorization,
        },
      })
      .pipe(
        map(async (axiosResponse: AxiosResponse) => {
          let data = axiosResponse.data;
          const cohortDto = [data];
          const cohortResponse = await this.mappedResponse(cohortDto);
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok..",
            data: cohortResponse[0],
          });
        })
      );
  }

  public async createCohort(request: any, cohortDto: CohortDto) {
    return this.httpService
      .post(`${this.url}/Class`, cohortDto, {
        headers: {
          Authorization: request.headers.authorization,
        },
      })
      .pipe(
        map((axiosResponse: AxiosResponse) => {
          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: axiosResponse.data,
          });
        }),
        catchError((e) => {
          var error = new ErrorResponse({
            errorCode: e.response?.status,
            errorMessage: e.response?.data?.params?.errmsg,
          });
          throw new HttpException(error, e.response.status);
        })
      );
  }
  public async updateCohort(cohortId: string, request: any, cohortDto: CohortDto) {
    var axios = require("axios");
    var data = cohortDto;

    var config = {
      method: "put",
      url: `${this.url}/Class/${cohortId}`,
      headers: {
        Authorization: request.headers.authorization,
      },
      data: data,
    };
    const response = await axios(config);
    return new SuccessResponse({
      statusCode: 200,
      message: " Ok.",
      data: response.data,
    });
  }

  public async searchCohort(request: any, cohortSearchDto: CohortSearchDto) {
    return this.httpService
      .post(`${this.url}/Class/search`, cohortSearchDto, {
        headers: {
          Authorization: request.headers.authorization,
        },
      })
      .pipe(
        map(async (response) => {
          const responsedata = response.data;
          const cohortResponse = await this.mappedResponse(responsedata);
          return new SuccessResponse({
            statusCode: response.status,
            message: "Ok.",
            data: cohortResponse,
          });
        }),
        catchError((e) => {
          var error = new ErrorResponse({
            errorCode: e.response.status,
            errorMessage: e.response.data.params.errmsg,
          });
          throw new HttpException(error, e.response.status);
        })
      );
  }
  public async findMembersOfCohort(id: string, role: string, request: any) {
    if (role == "Student") {
      let axios = require("axios");
      let data = {
        filters: {
          currentClassId: {
            eq: `${id}`,
          },
        },
      };

      let config = {
        method: "post",
        url: `${this.url}/Student/search`,
        headers: {
          Authorization: request.headers.authorization,
        },
        data: data,
      };

      const response = await axios(config);
      let result = await this.StudentMappedResponse(
        response?.data && response.data
      );

      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: result,
      });
    } else if (role == "Teacher") {
      let axios = require("axios");

      let final = {
        method: "get",
        url: `${this.url}/Class/${id}`,
        headers: {
          Authorization: request.headers.authorization,
        },
      };

      const response = await axios(final);
      let classObj = response?.data;
      let resData = [];
      if (classObj?.teacherId) {
        let classFinal = {
          method: "get",
          url: `${this.url}/User/${classObj.teacherId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };

        const responseData = await axios(classFinal);

        let response = await this.userMappedResponse([responseData.data]);
        resData = response;
      }
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: resData,
      });
    } else {
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: { msg: "Unable to get data !!" },
      });
    }
  }

  public async findCohortsByUserId(id: string, role: string, request: any) {
    let responseData = [];

    if (role === "Teacher") {
      let axios = require("axios");
      let data = {
        filters: {
          teacherId: {
            eq: `${id}`,
          },
        },
      };

      let final = {
        method: "post",
        url: `${this.url}/Class/search`,
        headers: {
          Authorization: request.headers.authorization,
        },
        data: data,
      };

      const response = await axios(final);
      responseData = response.data;
    } else if (role === "Student") {
      let axios = require("axios");
      const config = {
        method: "get",
        url: `${this.url}/Student/${id}`,
        headers: {
          Authorization: request.headers.authorization,
        },
      };

      const response = await axios(config);
      let studentObj = response?.data;

      if (studentObj?.cohortId) {
        let studentFinal = {
          method: "get",
          url: `${this.url}/Class/${studentObj.cohortId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };
        const resData = await axios(studentFinal);

        responseData = resData?.data ? [resData.data] : [];
      }
    }

    const cohortResponse = await this.mappedResponse(responseData);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: cohortResponse,
    });
  }
  public async findMembersOfChildCohort(
    cohortId: string,
    role: string,
    request: any
  ) {}

  public async mappedResponse(result: any) {
    const cohortResponse = result.map((item: any) => {
      const cohortMapping = {
        cohortId: item?.osid ? `${item.osid}` : "",
        schoolId: item?.schoolId ? `${item.schoolId}` : "",
        name: item?.name ? `${item.name}` : "",
        type: item?.type ? `${item.type}` : "",
        section: item?.section ? `${item.section}` : "",
        status: item?.status ? `${item.status}` : "",
        deactivationReason: item?.deactivationReason
          ? `${item.deactivationReason}`
          : "",
        mediumOfInstruction: item?.mediumOfInstruction
          ? `${item.mediumOfInstruction}`
          : "",
        teacherId: item?.teacherId ? `${item.teacherId}` : "",
        parentId: item?.parentId ? `${item.parentId}` : "",
        image: item?.image ? `${item.image}` : "",
        metaData: item?.metaData ? item.metaData : [],
        option: item?.option ? item.option : [],
        gradeLevel: item?.gradeLevel ? `${item.gradeLevel}` : "",
        createdAt: item?.osCreatedAt ? `${item.osCreatedAt}` : "",
        updatedAt: item?.osUpdatedAt ? `${item.osUpdatedAt}` : "",
        createdBy: item?.osCreatedBy ? `${item.osCreatedBy}` : "",
        updatedBy: item?.osUpdatedBy ? `${item.osUpdatedBy}` : "",
      };
      return new CohortDto(cohortMapping);
    });

    return cohortResponse;
  }
  public async StudentMappedResponse(result: any) {
    const studentResponse = result.map((item: any) => {
      const studentMapping = {
        studentId: item?.osid ? `${item.osid}` : "",
        refId1: item?.admissionNo ? `${item.admissionNo}` : "",
        refId2: item?.refId2 ? `${item.refId2}` : "",
        aadhaar: item?.aadhaar ? `${item.aadhaar}` : "",
        firstName: item?.firstName ? `${item.firstName}` : "",
        middleName: item?.middleName ? `${item.middleName}` : "",
        lastName: item?.lastName ? `${item.lastName}` : "",
        cohortId: item?.cohortId ? `${item.cohortId}` : "",
        schoolId: item?.schoolId ? `${item.schoolId}` : "",
        studentEmail: item?.studentEmail ? `${item.studentEmail}` : "",
        studentPhoneNumber: item?.studentPhoneNumber
          ? item.studentPhoneNumber
          : "",
        iscwsn: item?.iscwsn ? `${item.iscwsn}` : "",
        gender: item?.gender ? `${item.gender}` : "",
        socialCategory: item?.socialCategory ? `${item.socialCategory}` : "",
        religion: item?.religion ? `${item.religion}` : "",
        singleGirl: item?.singleGirl ? item.singleGirl : "",
        weight: item?.weight ? `${item.weight}` : "",
        height: item?.height ? `${item.height}` : "",
        bloodCohort: item?.bloodCohort ? `${item.bloodCohort}` : "",
        birthDate: item?.birthDate ? `${item.birthDate}` : "",
        homeless: item?.homeless ? item.homeless : "",
        bpl: item?.bpl ? item.bpl : "",
        migrant: item?.migrant ? item.migrant : "",
        status: item?.status ? `${item.status}` : "",

        fatherFirstName: item?.fatherFirstName ? `${item.fatherFirstName}` : "",

        fatherMiddleName: item?.fatherMiddleName
          ? `${item.fatherMiddleName}`
          : "",

        fatherLastName: item?.fatherLastName ? `${item.fatherLastName}` : "",
        fatherPhoneNumber: item?.fatherPhoneNumber
          ? item.fatherPhoneNumber
          : "",
        fatherEmail: item?.fatherEmail ? `${item.fatherEmail}` : "",

        motherFirstName: item?.motherFirstName ? `${item.motherFirstName}` : "",
        motherMiddleName: item?.motherMiddleName
          ? `${item.motherMiddleName}`
          : "",
        motherLastName: item?.motherLastName ? `${item.motherLastName}` : "",
        motherPhoneNumber: item?.motherPhoneNumber
          ? item.motherPhoneNumber
          : "",
        motherEmail: item?.motherEmail ? `${item.motherEmail}` : "",

        guardianFirstName: item?.guardianFirstName
          ? `${item.guardianFirstName}`
          : "",
        guardianMiddleName: item?.guardianMiddleName
          ? `${item.guardianMiddleName}`
          : "",
        guardianLastName: item?.guardianLastName
          ? `${item.guardianLastName}`
          : "",
        guardianPhoneNumber: item?.guardianPhoneNumber
          ? item.guardianPhoneNumber
          : "",
        guardianEmail: item?.guardianEmail ? `${item.guardianEmail}` : "",
        image: item?.image ? `${item.image}` : "",
        deactivationReason: item?.deactivationReason
          ? `${item.deactivationReason}`
          : "",
        studentAddress: item?.studentAddress ? `${item.studentAddress}` : "",
        village: item?.village ? `${item.village}` : "",
        block: item?.block ? `${item.block}` : "",
        district: item?.district ? `${item.district}` : "",
        stateId: item?.stateId ? `${item.stateId}` : "",
        pincode: item?.pincode ? item.pincode : "",
        locationId: item?.locationId ? `${item.locationId}` : "",
        metaData: item?.metaData ? item.metaData : [],
        createdAt: item?.osCreatedAt ? `${item.osCreatedAt}` : "",
        updatedAt: item?.osUpdatedAt ? `${item.osUpdatedAt}` : "",
        createdBy: item?.osCreatedBy ? `${item.osCreatedBy}` : "",
        updatedBy: item?.osUpdatedBy ? `${item.osUpdatedBy}` : "",
      };
      return new StudentDto(studentMapping);
    });

    return studentResponse;
  }

  public async userMappedResponse(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.osid ? `${item.osid}` : "",
        refId1: item?.refId1 ? `${item.refId1}` : "",
        refId2: item?.refId2 ? `${item.refId2}` : "",
        refId3: item?.refId3 ? `${item.refId3}` : "",
        firstName: item?.firstName ? `${item.firstName}` : "",
        middleName: item?.middleName ? `${item.middleName}` : "",
        lastName: item?.lastName ? `${item.lastName}` : "",
        phoneNumber: item?.phoneNumber ? `${item.phoneNumber}` : "",
        email: item?.email ? `${item.email}` : "",
        aadhaar: item?.aadhaar ? `${item.aadhaar}` : "",
        gender: item?.gender ? `${item.gender}` : "",
        socialCategory: item?.socialCategory ? `${item.socialCategory}` : "",
        birthDate: item?.birthDate ? `${item.birthDate}` : "",
        designation: item?.designation ? `${item.designation}` : "",
        cadre: item?.cadre ? `${item.cadre}` : "",
        profQualification: item?.profQualification
          ? `${item.profQualification}`
          : "",
        joiningDate: item?.joiningDate ? `${item.joiningDate}` : "",
        subjectIds: item.subjectIds ? item.subjectIds : [],
        bloodCohort: item?.bloodCohort ? `${item.bloodCohort}` : "",
        maritalStatus: item?.maritalStatus ? `${item.maritalStatus}` : "",
        compSkills: item?.compSkills ? `${item.compSkills}` : "",
        disability: item?.disability ? `${item.disability}` : "",
        religion: item?.religion ? `${item.religion}` : "",
        homeDistance: item?.homeDistance ? `${item.homeDistance}` : "",
        employmentType: item?.employmentType ? `${item.employmentType}` : "",
        schoolId: item?.schoolId ? `${item.schoolId}` : "",
        address: item?.address ? `${item.address}` : "",
        village: item?.village ? `${item.village}` : "",
        block: item?.block ? `${item.block}` : "",
        district: item?.district ? `${item.district}` : "",
        stateId: item?.stateId ? `${item.stateId}` : "",
        pincode: item?.pincode ? item.pincode : "",
        locationId: item?.locationId ? `${item.locationId}` : "",
        image: item?.image ? `${item.image}` : "",
        status: item?.status ? `${item.status}` : "",
        deactivationReason: item?.deactivationReason
          ? `${item.deactivationReason}`
          : "",
        reportsTo: item?.reportsTo ? `${item.reportsTo}` : "",
        retirementDate: item?.retirementDate ? `${item.retirementDate}` : "",
        workingStatus: item?.workingStatus ? `${item.workingStatus}` : "",
        fcmToken: item?.fcmToken ? `${item.fcmToken}` : "",
        role: item?.role ? `${item.role}` : "",
        employeeCode: item?.employeeCode ? `${item.employeeCode}` : "",
        metaData: item?.metaData ? item.metaData : [],
        createdAt: item?.osCreatedAt ? `${item.osCreatedAt}` : "",
        updatedAt: item?.osUpdatedAt ? `${item.osUpdatedAt}` : "",
        createdBy: item?.osCreatedBy ? `${item.osCreatedBy}` : "",
        updatedBy: item?.osUpdatedBy ? `${item.osUpdatedBy}` : "",
      };
      return new UserDto(userMapping);
    });

    return userResponse;
  }
}
