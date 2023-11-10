import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { IServicelocator } from "../userservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import jwt_decode from "jwt-decode";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { ErrorResponse } from "src/error-response";
import { FieldsService } from "./services/fields.service";
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

  constructor(
    private httpService: HttpService,
    private fieldsService: FieldsService
  ) {}
  updateUser(id: string, request: any, teacherDto: UserDto) {
    throw new Error("Method not implemented.");
  }

  public async getUser(
    tenantId: string,
    userId: string,
    accessRole: string,
    request: any,
    res: any
  ) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userRoles =
        decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];

      const data = {
        query: `query GetUser($userId: uuid!, $tenantId: uuid!, $context: String!, $contextId: uuid!, $access : String!) {
          Users(where: {tenantId: {_eq: $tenantId}, userId: {_eq: $userId}}) {
            username
            userId
            name
            email
            district
            state
            address
            pincode
            mobile
            dob
            role
            tenantId
            updatedAt
            updatedBy
            createdBy
            createdAt
            fields: UsersFieldsTenants(where: {context: {_eq: $context}, access: {_eq: $access}}) {
              tenantId
              fieldId
              assetId
              context
              contextId
              groupId
              name
              label
              defaultValue
              type
              note
              description
              state
              required
              ordering
              metadata
              access
              onlyUseInSubform
              updatedAt
              updatedBy
              createdAt
              createdBy
              fieldValues: FieldValues(where: {itemId: {_eq: $contextId}}) {
                value
                itemId
                fieldId
                fieldValuesId
                updatedBy
                updatedAt
                createdBy
                createdAt
              }
            }
          }
        }`,
        variables: {
          userId: userId,
          tenantId: tenantId,
          context: "Users",
          contextId: userId,
          access: accessRole,
        },
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
        return res.status(400).send({
          errorCode: response?.data?.errors[0]?.extensions?.code,
          errorMessage: response?.data?.errors[0]?.message,
        });
      } else {
        const result = response.data.data.Users;
        return res.status(200).send({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });
      }
    } catch (e) {
      console.log(e);
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: e.message,
      });
    }
  }

  public async createUser(request: any, userDto: UserDto) {
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userRoles =
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

      // if (altUserRoles.includes("systemAdmin")) {
      const keycloakResponse = await getKeycloakAdminToken();
      const token = keycloakResponse.data.access_token;

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
      // } else {
      //   return new ErrorResponse({
      //     errorCode: "401",
      //     errorMessage: "Unauthorized",
      //   });
      // }

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
        "x-hasura-role": getUserRole(userRoles),
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
          await this.fieldsService.searchFieldValuesFilter(fieldsFilter);

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
          let result_data = await this.searchUserFields(tenantId, userResponse);

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
      const res = keycloakResponse.data.access_token;
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
    } catch (e) {
      console.log(e);
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
      console.log(e);
      return e;
    }
  }

  public async searchUserFields(tenantId: string, users: any) {
    // function uses field service to get extra field and respective fieldValues for each user
    // ****Need extra field for access via role
    let userWithFields = [];
    for (let i = 0; i < users.length; i++) {
      let new_obj = new Object(users[i]);
      let userId = new_obj["userId"];
      //get fields
      let response = await this.fieldsService.getFieldsContext(
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
          "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
          "Content-Type": "application/json",
        },
        data: data,
      };

      const response = await this.axios(config);

      return response;
    } catch (e) {
      console.log(e);
      return e;
    }
  }
}
