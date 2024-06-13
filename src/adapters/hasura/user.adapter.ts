import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import jwt_decode from "jwt-decode";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";
import { FieldsService } from "./services/fields.service";
import { UserData } from "src/user/user.controller";
// import { UserUpdateDto } from "src/user/dto/user-update.dto";
import {
  getUserRole,
  getKeycloakAdminToken,
  createUserInKeyCloak,
  checkIfUsernameExistsInKeycloak,
} from "../../common/utils/keycloak.adapter.util";
import { DecryptPIIDataDTO, UserCreateDto } from "src/user/dto/user-create.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { Response } from "express";

@Injectable()
export class HasuraUserService implements IServicelocator {
  axios = require("axios");

  constructor(
    private httpService: HttpService,
    private fieldsService: FieldsService
  ) { }
  checkUser(body: any, response: any) {
    throw new Error("Method not implemented.");
  }
  public async findUserDetails(userID: any, username: String) {

  }
  public async getUsersDetailsById(userData: UserData, response: any) { }

  public async checkAndAddUser(request: any, userDto: UserCreateDto) {
    // try {
    //   const decoded: any = jwt_decode(request.headers.authorization);
    //   const altUserRoles =
    //     decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    //   const userId =
    //     decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    //   userDto.createdBy = userId;
    //   userDto.updatedBy = userId;

    //   if (
    //     !userDto.username ||
    //     !userDto.password ||
    //     !userDto.role ||
    //     !userDto.name
    //   ) {
    //     return new ErrorResponse({
    //       errorCode: "400",
    //       errorMessage: "Name, username, password and role are required",
    //     });
    //   }

    //   const keycloakResponse = await getKeycloakAdminToken();
    //   const token = keycloakResponse.data.access_token;

    //   const usernameExistsInKeycloak = await checkIfUsernameExistsInKeycloak(
    //     userDto.username,
    //     token
    //   );
    //   if (usernameExistsInKeycloak?.data[0]?.username) {
    //     const usernameExistsInDB: any = await this.getUserByUsername(
    //       usernameExistsInKeycloak?.data[0]?.username,
    //       request
    //     );
    //     if (usernameExistsInDB?.statusCode === 200) {
    //       if (usernameExistsInDB?.data) {
    //         return usernameExistsInDB;
    //       } else {
    //         const resetPasswordRes: any = await this.resetKeycloakPassword(
    //           request,
    //           token,
    //           userDto.password,
    //           usernameExistsInKeycloak?.data[0]?.id
    //         );

    //         if (resetPasswordRes.statusCode !== 204) {
    //           return new ErrorResponse({
    //             errorCode: "400",
    //             errorMessage: "Something went wrong in password reset",
    //           });
    //         }

    //         userDto.userId = usernameExistsInKeycloak?.data[0]?.id;
    //         const newlyCreatedDbUser = await this.createUserInDatabase(
    //           request,
    //           userDto
    //         );

    //         return newlyCreatedDbUser;
    //       }
    //     } else {
    //       return usernameExistsInDB;
    //     }
    //   } else {
    //     return await this.createUser(request, userDto);
    //   }
    // } catch (e) {
    //   console.error(e);
    //   return e;
    // }
  }

  public async createUser(request: any, userCreateDto: UserCreateDto) {
  }

  async createUserInDatabase(request: any, userCreateDto: UserCreateDto) {
    try {
      let query = "";
      Object.keys(userCreateDto).forEach((e) => {
        if (
          userCreateDto[e] &&
          userCreateDto[e] !== "" &&
          e != "password" &&
          e != "fieldValues"
        ) {
          if (e === "role") {
            query += `${e}: ${userCreateDto[e]},`;
          } else if (Array.isArray(userCreateDto[e])) {
            query += `${e}: ${JSON.stringify(userCreateDto[e])}, `;
          } else {
            query += `${e}: ${JSON.stringify(userCreateDto[e])}, `;
          }
        }
      });

      const data = {
        query: `mutation CreateUser {
        insert_Users_one(object: {${query}}) {
          userId
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
      const response = await this.axios(config);

      if (response?.data?.errors || userCreateDto.userId == undefined) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      } else {
      }
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async updateUser(
    userUpdateDto: UserCreateDto,
    userData
  ) {
    let query = "";
    Object.keys(userUpdateDto).forEach((e) => {
      if (
        userUpdateDto[e] &&
        userUpdateDto[e] != "" &&
        e != "password" &&
        e != "username" &&
        e != "fieldValues"
      ) {
        if (Array.isArray(userUpdateDto[e])) {
          query += `${e}: "${JSON.stringify(userUpdateDto[e])}", `;
        } else {
          query += `${e}: "${userUpdateDto[e]}", `;
        }
      }
    });

    var data = {
      query: `
      mutation UpdateUser($userId:uuid!) {
        update_Users_by_pk(
            pk_columns: {
              userId: $userId
            },
            _set: {
                ${query}
            }
        ) {
            userId
        }
    }
    `,
      variables: {
        userId: userUpdateDto.userId,
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

    const response = await this.axios(config);

    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
    }
  }

  public async searchUser(
    tenantId: string,
    request: any,
    response: any,
    userSearchDto: UserSearchDto
  ) {
    try {
      // const decoded: any = jwt_decode(request.headers.authorization);
      // const userRoles =
      //   decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const fieldsFilter = userSearchDto.filters["fields"];
      delete userSearchDto.filters["fields"];
      let newUserSearchDto = null;

      if (fieldsFilter) {
        //apply filter on fields value

        // searchfieldValuesFilter returns the contexts here userId that match the fieldId and value pair
        const responseFieldsValue =
          await this.fieldsService.searchFieldValuesFilter(request, fieldsFilter);

        if (responseFieldsValue?.data?.errors) {
          return response.status(400).send({
            errorCode: responseFieldsValue?.data?.errors[0]?.extensions?.code,
            errorMessage: responseFieldsValue?.data?.errors[0]?.message,
          });
        } else {
          // get filter result
          let resultFieldValues = responseFieldsValue?.data?.data?.FieldValues;
          // fetch user id list
          let userIdList = [];
          for (let i = 0; i < resultFieldValues.length; i++) {
            userIdList.push(resultFieldValues[i].itemId);
          }
          // remove duplicate entries
          userIdList = userIdList.filter(
            (item, index) => userIdList.indexOf(item) === index
          );
          let userFilter = new Object(userSearchDto.filters);
          userFilter["userId"] = {
            _in: userIdList,
          };
          newUserSearchDto = new UserSearchDto({
            limit: userSearchDto.limit,
            page: userSearchDto.page,
            filters: userFilter,
          });
        }
      } else {
        newUserSearchDto = new UserSearchDto({
          limit: userSearchDto.limit,
          page: userSearchDto.page,
          filters: userSearchDto.filters,
        });
      }
      if (newUserSearchDto) {
        const responseUser = await this.searchUserQuery(
          tenantId,
          newUserSearchDto,
          request
        );
        if (responseUser?.data?.errors) {
          return response.status(400).send({
            errorCode: responseUser?.data?.errors[0]?.extensions?.code,
            errorMessage: responseUser?.data?.errors[0]?.message,
          });
        } else {
          let result = responseUser?.data?.data?.Users;

          let userResponse = await this.mappedResponse(result);

          const count = result.length;
          //get user fields value
          let result_data = await this.searchUserFields(request, tenantId, userResponse);

          return response.status(200).send({
            statusCode: 200,
            message: "Ok.",
            totalCount: count,
            data: result_data,
          });
        }
      } else {
        return response.status(200).send({
          errorCode: "filter invalid",
          errorMessage: "filter invalid",
        });
      }
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async mappedResponse(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        name: item?.name ? `${item.name}` : "",
        username: item?.username ? `${item.username}` : "",
        email: item?.email ? `${item.email}` : "",
        mobile: item?.mobile ? item.mobile : "",
        dob: item?.dob ? `${item.dob}` : "",
        state: item?.state ? `${item.state}` : "",
        address: item?.address ? `${item.address}` : "",
        pincode: item?.pincode ? `${item.pincode}` : "",
        district: item?.district ? `${item.district}` : "",
        role: item?.role ? `${item.role}` : "",
        tenantId: item?.tenantId ? `${item.tenantId}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
      };
      return new UserDto(userMapping);
    });

    return userResponse;
  }

  public async getUserByAuth(tenantId: string, request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const username = decoded.preferred_username;

      const data = {
        query: `query userByAuth($username:String) {
        Users(where: {username: {_eq: $username}}) {
          tenantId
          userId
          name
          username
          role
          email
          mobile
          dob
          state
          district
          address
          pincode
          createdAt
          createdBy
          updatedAt
          updatedBy
        }
      }`,
        variables: { username: username },
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-role": getUserRole(userRoles),
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await this.axios(config);

      if (response?.data?.errors) {
        console.log(response?.data?.errors);
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      }
      const result = response.data.data.Users;

      const userData = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData,
      });
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async resetKeycloakPassword(
    request: any,
    token: string,
    newPassword: string,
    userId: string
  ) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const data = JSON.stringify({
      temporary: "false",
      type: "password",
      value: newPassword,
    });

    if (!token) {
      const response = await getKeycloakAdminToken();
      token = response.data.access_token;
    }

    let apiResponse;

    const config = {
      method: "put",
      url:
        process.env.KEYCLOAK +
        process.env.KEYCLOAK_ADMIN +
        "/" +
        userId +
        "/reset-password",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: data,
    };

    try {
      apiResponse = await this.axios(config);
    } catch (e) {
      return new ErrorResponse({
        errorCode: `${e.response.status}`,
        errorMessage: e.response.data.error,
      });
    }

    if (apiResponse.status === 204) {
      return new SuccessResponse({
        statusCode: apiResponse.status,
        message: apiResponse.statusText,
        data: { msg: "Password reset successful!" },
      });
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: apiResponse.errors,
      });
    }
  }

  public async resetUserPassword(
    request: any,
    username: string,
    newPassword: string
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const userData: any = await this.getUserByUsername(username, request);
      let userId;

      if (userData?.data?.userId) {
        userId = userData.data.userId;
      } else {
        return new ErrorResponse({
          errorCode: `404`,
          errorMessage: "User with given username not found",
        });
      }

      const data = JSON.stringify({
        temporary: "false",
        type: "password",
        value: newPassword,
      });

      const keycloakResponse = await getKeycloakAdminToken();
      const resToken = keycloakResponse.data.access_token;
      let apiResponse;

      try {
        apiResponse = await this.resetKeycloakPassword(
          request,
          resToken,
          newPassword,
          userId
        );
      } catch (e) {
        return new ErrorResponse({
          errorCode: `${e.response.status}`,
          errorMessage: e.response.data.error,
        });
      }

      if (apiResponse.statusCode === 204) {
        return new SuccessResponse({
          statusCode: apiResponse.statusCode,
          message: apiResponse.message,
          data: apiResponse.data,
        });
      } else {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: apiResponse.errors,
        });
      }
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async getUserByUsername(username: string, request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const data = {
        query: `query GetUserByUsername($username:String) {
        Users(where: {username: {_eq: $username}}){
          tenantId
          userId
          name
          username
          role
          email
          mobile
          dob
          state
          district
          address
          pincode
          createdAt
          createdBy
          updatedAt
          updatedBy
        }
      }
      `,
        variables: { username: username },
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-role": getUserRole(userRoles),
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await this.axios(config);

      if (response?.data?.errors) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message,
        });
      } else {
        const result = response.data.data.Users;
        const userData = await this.mappedResponse(result);
        return new SuccessResponse({
          statusCode: response.status,
          message: "Ok.",
          data: userData[0],
        });
      }
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async searchUserFields(request: any, tenantId: string, users: any) {
    // function uses field service to get extra field and respective fieldValues for each user
    // ****Need extra field for access via role
    let userWithFields = [];
    for (let i = 0; i < users.length; i++) {
      let new_obj = new Object(users[i]);
      let userId = new_obj["userId"];
      //get fields
      let response = await this.fieldsService.getFieldsContext(
        request,
        tenantId,
        "Users",
        userId
      );
      if (response?.data?.errors) {
      } else {
        let result = response?.data?.data?.Fields;
        new_obj["fields"] = result;
      }
      userWithFields.push(new_obj);
    }

    // userWithFields = users.map(async (user) => {});

    return userWithFields;
  }

  public async searchUserQuery(
    tenantId: string,
    userSearchDto: UserSearchDto,
    request: any
  ) {
    // function to search users within the user tables
    try {
      let offset = 0;
      if (userSearchDto.page > 1) {
        offset = parseInt(userSearchDto.limit) * (userSearchDto.page - 1);
      }

      const filters = userSearchDto.filters;

      //add tenantid
      filters["tenantId"] = { _eq: tenantId ? tenantId : "" };

      Object.keys(userSearchDto.filters).forEach((item) => {
        Object.keys(userSearchDto.filters[item]).forEach((e) => {
          if (!e.startsWith("_")) {
            filters[item][`_${e}`] = filters[item][e];
            delete filters[item][e];
          }
        });
      });

      const data = {
        query: `query SearchUser($filters:Users_bool_exp,$limit:Int, $offset:Int) {
        Users_aggregate(where:$filters, limit: $limit, offset: $offset,) {
          aggregate {
            count
          }
        }
        Users(where:$filters, limit: $limit, offset: $offset,) {
          userId
          name
          username
          email
          district
          state 
          address
          pincode
          mobile
          dob
          role
          tenantId
          createdAt
          updatedAt
          createdBy
          updatedBy
            }
          }`,
        variables: {
          limit: parseInt(userSearchDto.limit),
          offset: offset,
          filters: userSearchDto.filters,
        },
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await this.axios(config);

      return response;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  public async deleteUserById(userId) { }
  public async userDecryptData(decryptPIIDataDTO: DecryptPIIDataDTO, tenantId: string, response: Response) { }

}