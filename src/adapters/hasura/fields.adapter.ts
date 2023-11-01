import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { IServicelocatorfields } from "../fieldsservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
export const HasuraFieldsToken = "HasuraFields";
@Injectable()
export class HasuraFieldsService implements IServicelocatorfields {
  constructor(private httpService: HttpService) {}

  url = `${process.env.BASEAPIURL}`;

  public async createFields(request: any, fieldsDto: FieldsDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldsDto).forEach((e) => {
      if (fieldsDto[e] && fieldsDto[e] != "") {
        if (Array.isArray(fieldsDto[e])) {
          query += `${e}: ${JSON.stringify(fieldsDto[e])}, `;
        } else {
          query += `${e}: "${fieldsDto[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateFields {
        insert_fields_one(object: {${query}}) {
          field_id
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
      const result = response.data.data.insert_fields_one;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async getFields(tenantId: string, fieldsId: any, request: any) {
    var axios = require("axios");

    var data = {
      query: `query GetFields($fieldsId:uuid!, $tenantId:String!) {
        fields(
          where:{
            TenantId:{
              _eq:$tenantId
            }
            field_id:{
              _eq:$fieldsId
            },
          }
        ){
          TenantId
          field_id
          asset_id
          context
          group_id
          name
          label
          default_value
          type
          note
          description
          state
          required
          ordering
          metadata
          access
          only_use_in_subform
      }
    }`,
      variables: {
        fieldsId: fieldsId,
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
      let result = response?.data?.data?.fields;
      const fieldsResponse = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: fieldsResponse[0],
      });
    }
  }

  public async searchFields(
    tenantId: string,
    request: any,
    fieldsSearchDto: FieldsSearchDto
  ) {
    var axios = require("axios");

    let offset = 0;
    if (fieldsSearchDto.page > 1) {
      offset = parseInt(fieldsSearchDto.limit) * (fieldsSearchDto.page - 1);
    }

    let temp_filters = fieldsSearchDto.filters;
    //add tenantid
    let filters = new Object(temp_filters);
    filters["TenantId"] = { _eq: tenantId ? tenantId : "" };

    Object.keys(fieldsSearchDto.filters).forEach((item) => {
      Object.keys(fieldsSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchFields($filters:fields_bool_exp,$limit:Int, $offset:Int) {
           fields(where:$filters, limit: $limit, offset: $offset,) {
              TenantId
              field_id
              asset_id
              context
              group_id
              name
              label
              default_value
              type
              note
              description
              state
              required
              ordering
              metadata
              access
              only_use_in_subform
            }
          }`,
      variables: {
        limit: parseInt(fieldsSearchDto.limit),
        offset: offset,
        filters: fieldsSearchDto.filters,
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
      let result = response.data.data.fields;
      const fieldsResponse = await this.mappedResponse(result);
      const count = fieldsResponse.length;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        totalCount: count,
        data: fieldsResponse,
      });
    }
  }

  public async updateFields(
    fieldsId: string,
    request: any,
    fieldsDto: FieldsDto
  ) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldsDto).forEach((e) => {
      if (fieldsDto[e] && fieldsDto[e] != "") {
        if (Array.isArray(fieldsDto[e])) {
          query += `${e}: ${JSON.stringify(fieldsDto[e])}, `;
        } else {
          query += `${e}: ${fieldsDto[e]}, `;
        }
      }
    });

    var data = {
      query: `mutation UpdateFields($fieldsId:uuid) {
          update_fields(where: {fieldsId: {_eq: $fieldsId}}, _set: {${query}}) {
          affected_rows
        }
}`,
      variables: {
        fieldsId: fieldsId,
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

  public async findMembersOfFields(
    fieldsId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    var findMember = {
      query: `query GetFieldsMembership($fieldsId:uuid,$role:String) {
       fieldsmembership(where: {fieldsId: {_eq: $fieldsId}, role: {_eq: $role}}) {
        userId
        role
        }
      }`,
      variables: {
        fieldsId: fieldsId,
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
    let result = response.data.data.fieldsmembership;
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

  public async findFieldssByUserId(userId: string, role: string, request: any) {
    let axios = require("axios");
    var findMember = {
      query: `query GetFields($userId:String,$role:String) {
        fieldsmembership(where: {userId: {_eq: $userId}, role: {_eq: $role}}) {
          fields {
            created_at
            deactivationReason
            gradeLevel
            fieldsId
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
    let fieldsData = response.data.data.fieldsmembership;
    const fieldsList = fieldsData.map((e: any) => {
      return e.fields;
    });

    const fieldsResponse = await this.mappedResponse(fieldsList);
    return new SuccessResponse({
      statusCode: 200,
      message: "ok",
      data: fieldsResponse,
    });
  }

  public async findMembersOfChildFields(
    parentId: string,
    role: string,
    request: any
  ) {
    let axios = require("axios");
    let userData = [];
    let userIds = [];
    var findParentId = {
      query: `query GetFieldsParentId($parentId:String) {
       fields(where: {parentId: {_eq: $parentId}}) {
        fieldsId
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

    const fieldsResponse = await axios(getParentId);
    let fieldsIds = fieldsResponse.data.data.fields.map((e: any) => {
      return e.fieldsId;
    });

    var findMember = {
      query: `query GetFieldsMembership($fieldsIds:[uuid!],$role:String) {
          fieldsmembership(where: {fieldsId: {_in:$fieldsIds},role: {_eq:$role }}) {
              userId
            role
          }
        }`,
      variables: {
        fieldsIds,
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
    let result = await response.data.data.fieldsmembership;

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
    const fieldsResponse = result.map((item: any) => {
      const fieldsMapping = {
        TenantId: item?.TenantId ? `${item.TenantId}` : "",
        field_id: item?.field_id ? `${item.field_id}` : "",
        asset_id: item?.asset_id ? `${item.asset_id}` : "",
        context: item?.context ? `${item.context}` : "",
        group_id: item?.group_id ? `${item.group_id}` : "",
        name: item?.name ? `${item.name}` : "",
        label: item?.label ? `${item.label}` : "",
        default_value: item?.default_value ? `${item.default_value}` : "",
        type: item?.type ? `${item.type}` : "",
        note: item?.note ? `${item.note}` : "",
        description: item?.description ? `${item.description}` : "",
        state: item?.state ? `${item.state}` : "",
        required: item?.required ? `${item.required}` : "",
        ordering: item?.ordering ? `${item.ordering}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
        access: item?.access ? `${item.access}` : "",
        only_use_in_subform: item?.only_use_in_subform
          ? `${item.only_use_in_subform}`
          : "",
      };
      return new FieldsDto(fieldsMapping);
    });

    return fieldsResponse;
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
        fieldsId: item?.fieldsId ? `${item.fieldsId}` : "",
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
        bloodFields: item?.bloodFields ? `${item.bloodFields}` : "",
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
        bloodFields: item?.bloodFields ? `${item.bloodFields}` : "",
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
