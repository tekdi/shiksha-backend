import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import jwt_decode from "jwt-decode";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";
// import { UserUpdateDto } from "src/user/dto/user-update.dto";
import {
  getUserRole,
  getKeycloakAdminToken,
  createUserInKeyCloak,
  checkIfUsernameExistsInKeycloak,
} from "./keycloak.adapter.util";

@Injectable()
export class HasuraUserService implements IServicelocator {
  axios = require("axios");

  constructor(private httpService: HttpService) {}
  updateUser(id: string, request: any, teacherDto: UserDto) {
    throw new Error("Method not implemented.");
  }

  public async getUser(tenantId: string, userId: string, request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const data = {
        query: `query GetUser($userId:uuid!) {
        Users_by_pk(userId: $userId) {
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
      }
      `,
        variables: { userId: userId },
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: {
          Authorization: request.headers.authorization,
          "x-hasura-role": getUserRole(altUserRoles),
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
        const result = [response.data.data.Users_by_pk];

        const userData = await this.mappedResponse(result);
        return new SuccessResponse({
          statusCode: response.status,
          message: "Ok.",
          data: userData[0],
        });
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  public async createUser(request: any, userDto: UserDto) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const userId =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      userDto.createdBy = userId;
      userDto.updatedBy = userId;

      userDto.username = userDto.username.toLocaleLowerCase();

      const userSchema = new UserDto(userDto);

      let query = "";
      let errKeycloak = "";
      let resKeycloak = "";

      if (altUserRoles.includes("systemAdmin")) {
        const response = await getKeycloakAdminToken();
        const token = response.data.access_token;

        const usernameExistsInKeycloak = await checkIfUsernameExistsInKeycloak(
          userDto.username,
          token
        );

        if (usernameExistsInKeycloak?.data[0]?.username) {
          return new ErrorResponse({
            errorCode: "400",
            errorMessage: "Username already exists",
          });
        }

        resKeycloak = await createUserInKeyCloak(userSchema, token).catch(
          (error) => {
            errKeycloak = error.response?.data.errorMessage;
            console.log(errKeycloak);
            return new ErrorResponse({
              errorCode: "500",
              errorMessage: "Someting went wrong",
            });
          }
        );
      } else {
        return new ErrorResponse({
          errorCode: "401",
          errorMessage: "Unauthorized",
        });
      }

      Object.keys(userDto).forEach((e) => {
        if (
          userDto[e] &&
          userDto[e] !== "" &&
          e != "password" &&
          Object.keys(userSchema).includes(e)
        ) {
          if (e === "role") {
            query += `${e}: ${userDto[e]},`;
          } else if (Array.isArray(userDto[e])) {
            query += `${e}: ${JSON.stringify(userDto[e])}, `;
          } else {
            query += `${e}: ${JSON.stringify(userDto[e])}, `;
          }
        }
      });

      // Add userId created in keycloak as user Id of ALT user
      query += `userId: "${resKeycloak}"`;
      const data = {
        query: `mutation CreateUser {
        insert_Users_one(object: {${query}}) {
          userId
        }
      }
      `,
        variables: {},
      };

      const headers = {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
        "Content-Type": "application/json",
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: headers,
        data: data,
      };

      const response = await this.axios(config);

      if (response?.data?.errors || resKeycloak == undefined) {
        return new ErrorResponse({
          errorCode: response.data.errors[0].extensions,
          errorMessage: response.data.errors[0].message + errKeycloak,
        });
      } else {
        const result = response.data.data.insert_Users_one;

        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  //   public async updateUser(
  //     userId: string,
  //     request: any,
  //     userUpdateDto: UserUpdateDto
  //   ) {
  //     const userSchema = new UserUpdateDto(userUpdateDto);
  //     let userUpdate = "";
  //     Object.keys(userUpdateDto).forEach((e) => {
  //       if (
  //         userUpdateDto[e] &&
  //         userUpdateDto[e] != "" &&
  //         Object.keys(userSchema).includes(e)
  //       ) {
  //         if (e === "role") {
  //           userUpdate += `${e}: ${userUpdateDto[e]},`;
  //         } else if (Array.isArray(userUpdateDto[e])) {
  //           userUpdate += `${e}: ${JSON.stringify(userUpdateDto[e])}, `;
  //         } else {
  //           userUpdate += `${e}: ${JSON.stringify(userUpdateDto[e])}, `;
  //         }
  //       }
  //     });

  //     const data = {
  //       query: `mutation UpdateUser ($userId:uuid){
  //         update_Users(where: {userId: {_eq: $userId}}, _set: {${userUpdate}}) {
  //           affected_rows
  //         }
  //       }`,
  //       variables: {
  //         userId: userId,
  //       },
  //     };

  //     const config = {
  //       method: "post",
  //       url: process.env.REGISTRYHASURA,
  //       headers: {
  //         "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
  //         "Content-Type": "application/json",
  //       },
  //       data: data,
  //     };

  //     const response = await this.axios(config);

  //     if (response?.data?.errors) {
  //       return new ErrorResponse({
  //         errorCode: response.data.errors[0].extensions,
  //         errorMessage: response.data.errors[0].message,
  //       });
  //     } else {
  //       const result = response.data.data.update_Users;
  //       return new SuccessResponse({
  //         statusCode: 200,
  //         message: "Ok.",
  //         data: result,
  //       });
  //     }
  //   }

  public async searchUser(
    tenantId: string,
    request: any,
    userSearchDto: UserSearchDto
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      let offset = 0;
      if (userSearchDto.page > 1) {
        offset = parseInt(userSearchDto.limit) * (userSearchDto.page - 1);
      }

      const filters = userSearchDto.filters;

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

      const headers = {
        Authorization: request.headers.authorization,
        "x-hasura-role": getUserRole(altUserRoles),
        "Content-Type": "application/json",
      };

      const config = {
        method: "post",
        url: process.env.REGISTRYHASURA,
        headers: headers,
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
        const count = response?.data?.data?.Users_aggregate?.aggregate?.count;

        return new SuccessResponse({
          statusCode: 200,
          message: "Ok. Found " +count+" records",
          data: userData,
        });
      }
    } catch (e) {
      console.log(e);
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
      const altUserRoles =
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
          "x-hasura-role": getUserRole(altUserRoles),
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await this.axios(config);

      const result = response.data.data.Users;

      const userData = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: userData,
      });
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  public async resetUserPassword(
    request: any,
    username: string,
    newPassword: string
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
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

      if (altUserRoles.includes("systemAdmin")) {
        const response = await getKeycloakAdminToken();
        const res = response.data.access_token;
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
            Authorization: "Bearer " + res,
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
      } else {
        return new ErrorResponse({
          errorCode: "401",
          errorMessage: "Unauthorized",
        });
      }
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  public async getUserByUsername(username: string, request: any) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const altUserRoles =
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
          "x-hasura-role": getUserRole(altUserRoles),
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
      console.log(e);
      return e;
    }
  }
}
