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
  checkIfUsernameExistsInKeycloak
} from "./keycloak.adapter.util";

@Injectable()
export class HasuraUserService implements IServicelocator {
  axios = require("axios");

  constructor(private httpService: HttpService) {}
  updateUser(id: string, request: any, teacherDto: UserDto) {
    throw new Error("Method not implemented.");
  }

  public async getUser(userId: string, request: any) {
    console.log(request.headers);
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
            mobile
            dob
            role
            createdAt
            updatedAt
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
    console.log(response, "res");

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
  }

  public async createUser(request: any, userDto: UserDto) {
    const decoded: any = jwt_decode(request.headers.authorization);
    const altUserRoles =
      decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

    const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
    userDto.createdBy = userId;
    userDto.updatedBy = userId;

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
        // console.log("check in db", usernameExistsInKeycloak?.data[0]?.id);
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

  //   public async searchUser(request: any, userSearchDto: UserSearchDto) {
  //     let offset = 0;
  //     if (userSearchDto.page > 1) {
  //       offset = userSearchDto.limit * (userSearchDto.page - 1);
  //     }

  //     const filters = userSearchDto.filters;

  //     let query = "";
  //     Object.keys(userSearchDto.filters).forEach((e) => {
  //       if (userSearchDto.filters[e] && userSearchDto.filters[e] != "") {
  //         if (e === "name" || e === "username") {
  //           query += `${e}:{_ilike: "%${userSearchDto.filters[e]}%"}`;
  //         } else {
  //           query += `${e}:{_eq:"${userSearchDto.filters[e]}"}`;
  //         }
  //       }
  //     });

  //     const data = {
  //       query: `query SearchUser($limit:Int, $offset:Int) {
  //         Users_aggregate {
  //           aggregate {
  //             count
  //           }
  //         }
  //         Users(where:{${query}}, limit: $limit, offset: $offset,) {
  //             userId
  //             name
  //             username
  //             father
  //             mother
  //             uniqueId
  //             email
  //             mobileNumber
  //             birthDate
  //             bloodGroup
  //             udise
  //             school
  //             board
  //             grade
  //             medium
  //             state
  //             district
  //             block
  //             role
  //             gender
  //             section
  //             status
  //             image
  //             createdBy
  //             updatedBy
  //             createdAt
  //             updatedAt
  //             }
  //           }`,
  //       variables: {
  //         limit: userSearchDto.limit,
  //         offset: offset,
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
  //       const result = response.data.data.Users;
  //       const userData = await this.mappedResponse(result);
  //       const count = response?.data?.data?.user_aggregate?.aggregate?.count;

  //       return new SuccessResponse({
  //         statusCode: 200,
  //         message: "Ok.",
  //         data: userData,
  //       });
  //     }
  //   }

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
        role: item?.role ? `${item.role}` : "",
        createdAt: item?.createdAt ? `${item.createdAt}` : "",
        updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
        createdBy: item?.createdBy ? `${item.createdBy}` : "",
        updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
      };
      return new UserDto(userMapping);
    });

    return userResponse;
  }

  public async getUserByAuth(request: any) {
    const authToken = request.headers.authorization;
    const decoded: any = jwt_decode(authToken);

    const username = decoded.preferred_username;

    const data = {
      query: `query searchUser($username:String) {
        Users(where: {username: {_eq: $username}}) {
          userId
            name
            username
            father
            mother
            uniqueId
            email
            mobileNumber
            birthDate
            bloodGroup
            udise
            school
            board
            grade
            medium
            state
            district
            block
            role
            gender
            section
            status
            image
            created_at
            createdBy
            updated_at
            updatedBy
        }
      }`,
      variables: { username: username },
    };

    const config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
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
  }

  public async resetUserPassword(
    request: any,
    username: string,
    newPassword: string
  ) {
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

    const response = await getKeycloakAdminToken();
    const res = response.data.access_token;
    let apiResponse;

    const config = {
      method: "put",
      url:
        "https://alt-shiksha.uniteframework.io/auth/admin/realms/hasura/users/" +
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
  }

  public async getUserByUsername(username: string, request: any) {
    const data = {
      query: `query GetUserByUsername($username:String) {
        Users(where: {username: {_eq: $username}}){
            userId
            name
            username
            father
            mother
            uniqueId
            email
            mobileNumber
            birthDate
            bloodGroup
            udise
            school
            board
            grade
            medium
            state
            district
            block
            role
            gender
            section
            status
            image
        }
      }
      `,
      variables: { username: username },
    };

    const config = {
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
  }

  searchUser(request: any, teacherSearchDto: UserSearchDto) {
    throw new Error("Method not implemented.");
  }

  public async teacherSegment(
    schoolId: string,
    templateId: string,
    request: any
  ) {
    throw new Error("Method not implemented.");
  }
}
