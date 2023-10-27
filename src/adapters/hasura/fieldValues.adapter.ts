import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
const resolvePath = require("object-resolve-path");
import { FieldValuesDto } from "src/fieldValues/dto/fieldValues.dto";
import { FieldValuesSearchDto } from "src/fieldValues/dto/fieldValues-search.dto";
import { IServicelocatorfieldValues } from "../fieldValuesservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
export const HasuraFieldValuesToken = "HasuraFieldValues";
@Injectable()
export class HasuraFieldValuesService implements IServicelocatorfieldValues {
  constructor(private httpService: HttpService) {}

  url = `${process.env.BASEAPIURL}`;

  public async getFieldValues(fieldValuesId: any, request: any) {
    var axios = require("axios");

    var data = {
      query: `query GetFieldValues($fieldValuesId:uuid!) {
        fieldValues_by_pk(fieldValuesId: $fieldValuesId) {
        fieldValuesId
        deactivationReason
        created_at
        image
        mediumOfInstruction
        metaData
        name
        option
        schoolId
        section
        teacherId
        gradeLevel
        status
        type
        updated_at
        parentId
      }
    }`,
      variables: {
        fieldValuesId: fieldValuesId,
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

    let result = [response?.data?.data?.fieldValues_by_pk];
    const fieldValuesResponse = await this.mappedResponse(result);
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: fieldValuesResponse[0],
    });
  }

  public async createFieldValues(request: any, fieldValuesDto: FieldValuesDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldValuesDto).forEach((e) => {
      if (fieldValuesDto[e] && fieldValuesDto[e] != "") {
        if (Array.isArray(fieldValuesDto[e])) {
          query += `${e}: ${JSON.stringify(fieldValuesDto[e])}, `;
        } else {
          query += `${e}: "${fieldValuesDto[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateFieldValues {
        insert_fieldValues_one(object: {${query}}) {
         fieldValuesId
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

    const result = response.data.data.insert_fieldValues_one;

    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      data: result,
    });
  }

  public async updateFieldValues(
    fieldValuesId: string,
    request: any,
    fieldValuesDto: FieldValuesDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldValuesDto).forEach((e) => {
      if (fieldValuesDto[e] && fieldValuesDto[e] != "") {
        if (Array.isArray(fieldValuesDto[e])) {
          query += `${e}: ${JSON.stringify(fieldValuesDto[e])}, `;
        } else {
          query += `${e}: ${fieldValuesDto[e]}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateFieldValues($fieldValuesId:uuid) {
          update_fieldValues(where: {fieldValuesId: {_eq: $fieldValuesId}}, _set: {${query}}) {
          affected_rows
        }
}`,
      variables: {
        fieldValuesId: fieldValuesId,
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

  public async searchFieldValues(
    request: any,
    fieldValuesSearchDto: FieldValuesSearchDto
  ) {
    var axios = require("axios");

    let offset = 0;
    if (fieldValuesSearchDto.page > 1) {
      offset =
        parseInt(fieldValuesSearchDto.limit) * (fieldValuesSearchDto.page - 1);
    }

    let filters = fieldValuesSearchDto.filters;

    Object.keys(fieldValuesSearchDto.filters).forEach((item) => {
      Object.keys(fieldValuesSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchFieldValues($filters:fieldValues_bool_exp,$limit:Int, $offset:Int) {
        fieldValues_aggregate {
          aggregate {
            count
          }
        }
           fieldValues(where:$filters, limit: $limit, offset: $offset,) {
                fieldValuesId
                deactivationReason
                created_at
                image
                mediumOfInstruction
                metaData
                name
                option
                schoolId
                section
                status
                teacherId
                gradeLevel
                type
                updated_at
                parentId
            }
          }`,
      variables: {
        limit: parseInt(fieldValuesSearchDto.limit),
        offset: offset,
        filters: fieldValuesSearchDto.filters,
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

    let result = response.data.data.fieldValues;
    const fieldValuesResponse = await this.mappedResponse(result);
    const count = response?.data?.data?.fieldValues_aggregate?.aggregate?.count;
    return new SuccessResponse({
      statusCode: 200,
      message: "Ok.",
      totalCount: count,
      data: fieldValuesResponse,
    });
  }

  public async findMembersOfFieldValues(
    fieldValuesId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    var findMember = {
      query: `query GetFieldValuesMembership($fieldValuesId:uuid,$role:String) {
       fieldValuesmembership(where: {fieldValuesId: {_eq: $fieldValuesId}, role: {_eq: $role}}) {
        userId
        role
        }
      }`,
      variables: {
        fieldValuesId: fieldValuesId,
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
    let result = response.data.data.fieldValuesmembership;
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

  public async findFieldValuessByUserId(
    userId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    var findMember = {
      query: `query GetFieldValues($userId:String,$role:String) {
        fieldValuesmembership(where: {userId: {_eq: $userId}, role: {_eq: $role}}) {
          fieldValues {
            created_at
            deactivationReason
            gradeLevel
            fieldValuesId
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
    let fieldValuesData = response.data.data.fieldValuesmembership;
    const fieldValuesList = fieldValuesData.map((e: any) => {
      return e.fieldValues;
    });

    const fieldValuesResponse = await this.mappedResponse(fieldValuesList);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: fieldValuesResponse,
    });
  }

  public async findMembersOfChildFieldValues(
    parentId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    let userIds = [];
    var findParentId = {
      query: `query GetFieldValuesParentId($parentId:String) {
       fieldValues(where: {parentId: {_eq: $parentId}}) {
        fieldValuesId
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

    const fieldValuesResponse = await axios(getParentId);
    let fieldValuesIds = fieldValuesResponse.data.data.fieldValues.map(
      (e: any) => {
        return e.fieldValuesId;
      }
    );

    var findMember = {
      query: `query GetFieldValuesMembership($fieldValuesIds:[uuid!],$role:String) {
          fieldValuesmembership(where: {fieldValuesId: {_in:$fieldValuesIds},role: {_eq:$role }}) {
              userId
            role
          }
        }`,
      variables: {
        fieldValuesIds,
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
    let result = await response.data.data.fieldValuesmembership;

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
    const fieldValuesResponse = result.map((item: any) => {
      const fieldValuesMapping = {
        id: item?.fieldValuesId ? `${item.fieldValuesId}` : "",
        fieldValuesId: item?.fieldValuesId ? `${item.fieldValuesId}` : "",
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
        createdAt: item?.created_at ? `${item.created_at}` : "",
        updatedAt: item?.updated_at ? `${item.updated_at}` : "",
      };
      return new FieldValuesDto(fieldValuesMapping);
    });

    return fieldValuesResponse;
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
        fieldValuesId: item?.fieldValuesId ? `${item.fieldValuesId}` : "",
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
        bloodFieldValues: item?.bloodFieldValues
          ? `${item.bloodFieldValues}`
          : "",
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
        bloodFieldValues: item?.bloodFieldValues
          ? `${item.bloodFieldValues}`
          : "",
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
