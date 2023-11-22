// import { Injectable } from "@nestjs/common";
// import { EsamwadUserService } from "src/adapters/esamwad/user.adapter";
// import { UserService } from "src/adapters/sunbirdrc/user.adapter";
// import { HasuraUserService } from "src/adapters/hasura/user.adapter";
// import { IServicelocator } from "src/adapters/userservicelocator";

// @Injectable()
// export class UserAdapter {
//   constructor(
//     private eSamwadProvider: EsamwadUserService,
//     private sunbirdProvider: UserService,
//     private hasuraProvider: HasuraUserService
//   ) {}
//   buildUserAdapter(): IServicelocator {
//     let adapter: IServicelocator;

//     switch (process.env.REGISTYADAPTER) {
//       case "esamwad":
//         adapter = this.eSamwadProvider;
//         break;
//       case "sunbird":
//         adapter = this.sunbirdProvider;
//         break;
//       case "hasura":
//         adapter = this.hasuraProvider;
//         break;
//     }
//     return adapter;
//   }
// }


import { Injectable } from "@nestjs/common";
import { EsamwadUserService } from "src/adapters/esamwad/user.adapter";
import { UserService } from "src/adapters/sunbirdrc/user.adapter";
import { IServicelocator } from "src/adapters/userservicelocator";
import jwt_decode from "jwt-decode";
import { ErrorResponse } from "src/error-response";
import { SuccessResponse } from "src/success-response";
import { HttpService } from "@nestjs/axios";
import { UserDto } from "src/user/dto/user.dto";
import { getUserRole } from "src/adapters/hasura/role.adapter";

@Injectable()
export class UserAdapter {
  axios = require("axios");

  constructor(
    private eSamwadProvider: EsamwadUserService,
    private sunbirdProvider: UserService
  ) {}
  public async getUser(userId: string, request: any) {
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
            gender
            dateOfBirth
            role
            board
            status
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
      url: process.env.ALTHASURA,
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
  }

  
  public async mappedResponse(result: any) {
    const userResponse = result.map((item: any) => {
      const userMapping = {
        userId: item?.userId ? `${item.userId}` : "",
        name: item?.name ? `${item.name}` : "",
        username: item?.username ? `${item.username}` : "",
        schoolUdise: item?.schoolUdise ? `${item.schoolUdise}` : "",
        email: item?.email ? `${item.email}` : "",
        mobile: item?.mobile ? item.mobile : "",
        gender: item?.gender ? `${item.gender}` : "",
        dateOfBirth: item?.dateOfBirth ? `${item.dateOfBirth}` : "",
        status: item?.status ? `${item.status}` : "",
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
  buildUserAdapter(): IServicelocator {
    let adapter: IServicelocator;

    switch (process.env.REGISTYADAPTER) {
      case "esamwad":
        adapter = this.eSamwadProvider;
        break;
      case "sunbird":
        adapter = this.sunbirdProvider;
        break;
    }
    return adapter;
  }
}
