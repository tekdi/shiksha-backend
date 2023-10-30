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
export const HasuraCohortToken = "HasuraCohort";
@Injectable()
export class HasuraCohortService implements IServicelocatorcohort {
  private cohort: CohortInterface;

  constructor(private httpService: HttpService) {}

  url = `${process.env.BASEAPIURL}`;

  public async createCohort(request: any, cohortDto: CohortDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(cohortDto).forEach((e) => {
      if (cohortDto[e] && cohortDto[e] != "") {
        if (Array.isArray(cohortDto[e])) {
          query += `${e}: ${JSON.stringify(cohortDto[e])}, `;
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

  public async getCohort(tenantId: string, cohortId: any, request: any) {
    var axios = require("axios");

    var data = {
      query: `query GetCohort($cohortId:uuid!, $tenantId:String!) {
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
      const cohortResponse = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: cohortResponse[0],
      });
    }
  }

  public async searchCohort(
    tenantId: string,
    request: any,
    cohortSearchDto: CohortSearchDto
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
      let result = response.data.data.Cohort;
      const cohortResponse = await this.mappedResponse(result);
      const count = cohortResponse.length;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        totalCount: count,
        data: cohortResponse,
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
          query += `${e}: ${JSON.stringify(cohortDto[e])}, `;
        } else {
          query += `${e}: ${cohortDto[e]}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateCohort($cohortId:uuid) {
          update_cohort(where: {cohortId: {_eq: $cohortId}}, _set: {${query}}) {
          affected_rows
        }
}`,
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
    const result = response.data.data;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async findMembersOfCohort(
    cohortId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    var findMember = {
      query: `query GetCohortMembership($cohortId:uuid,$role:String) {
       cohortmembership(where: {cohortId: {_eq: $cohortId}, role: {_eq: $role}}) {
        userId
        role
        }
      }`,
      variables: {
        cohortId: cohortId,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findMember,
    };

    const response = await axios(getMemberData);
    let result = response.data.data.cohortmembership;
    if (Array.isArray(result)) {
      let userIds = result.map((e: any) => {
        return e.userId;
      });
      if (result[0].role == "Student") {
        for (let value of userIds) {
          let studentSearch = {
            method: "get",
            url: `${this.url}/Student/${value}`,
            headers: {
              Authorization: request.headers.authorization,
            },
          };

          const response = await axios(studentSearch);
          let responseData = await this.StudentMappedResponse([response.data]);
          let studentData = responseData[0];

          userData.push(studentData);
        }
      } else {
        for (let value of userIds) {
          let classFinal = {
            method: "get",
            url: `${this.url}/User/${value}`,
            headers: {
              Authorization: request.headers.authorization,
            },
          };

          const responseData = await axios(classFinal);

          let response = await this.userMappedResponse([responseData.data]);
          let teacherDetailDto = response[0];
          userData.push(teacherDetailDto);
        }
      }

      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: userData,
      });
    } else {
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: { msg: "Unable to get data !!" },
      });
    }
  }

  public async findCohortsByUserId(userId: string, role: string, request: any) {
    let axios = require("axios");
    var findMember = {
      query: `query GetCohort($userId:String,$role:String) {
        cohortmembership(where: {userId: {_eq: $userId}, role: {_eq: $role}}) {
          cohort {
            created_at
            deactivationReason
            gradeLevel
            cohortId
            image
            mediumOfInstruction
            metaData
            name
            option
            schoolId
            section
            status
            teacherId
            type
            updated_at
            parentId
          }
        }
      }
      `,
      variables: {
        userId: userId,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findMember,
    };
    const response = await axios(getMemberData);
    let cohortData = response.data.data.cohortmembership;
    const cohortList = cohortData.map((e: any) => {
      return e.cohort;
    });

    const cohortResponse = await this.mappedResponse(cohortList);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: cohortResponse,
    });
  }

  public async findMembersOfChildCohort(
    parentId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    let userIds = [];
    var findParentId = {
      query: `query GetCohortParentId($parentId:String) {
       cohort(where: {parentId: {_eq: $parentId}}) {
        cohortId
        }
      }`,
      variables: {
        parentId: parentId,
      },
    };

    var getParentId = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findParentId,
    };

    const cohortResponse = await axios(getParentId);
    let cohortIds = cohortResponse.data.data.cohort.map((e: any) => {
      return e.cohortId;
    });

    var findMember = {
      query: `query GetCohortMembership($cohortIds:[uuid!],$role:String) {
          cohortmembership(where: {cohortId: {_in:$cohortIds},role: {_eq:$role }}) {
              userId
            role
          }
        }`,
      variables: {
        cohortIds,
        role: role,
      },
    };

    var getMemberData = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: findMember,
    };

    const response = await axios(getMemberData);
    let result = await response.data.data.cohortmembership;

    result.map((e: any) => {
      return userIds.push(e.userId);
    });
    for (let userId of userIds) {
      if (role == "Student") {
        let studentSearch = {
          method: "get",
          url: `${this.url}/Student/${userId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };

        const response = await axios(studentSearch);

        let responseData = await this.StudentMappedResponse([response.data]);
        let studentData = responseData[0];

        userData.push(studentData);
      } else {
        let classFinal = {
          method: "get",
          url: `${this.url}/User/${userId}`,
          headers: {
            Authorization: request.headers.authorization,
          },
        };

        const responseData = await axios(classFinal);

        let response = await this.userMappedResponse([responseData.data]);
        let teacherDetailDto = response[0];
        userData.push(teacherDetailDto);
      }
    }

    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: userData,
    });
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
