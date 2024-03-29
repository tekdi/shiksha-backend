import { HttpStatus, Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import axios from "axios";
import qs from "qs";
import jwt_decode from "jwt-decode";
import APIResponse from "src/utils/response";

@Injectable()
export class AuthService {
  private axiosInstance;
  constructor(private readonly userService: UserService) {
    this.axiosInstance = axios.create();
  }

  async login(authDto, response) {
    try {
      const { KEYCLOAK, KEYCLOAK_USER_TOKEN, KEYCLOAK_HASURA_CLIENT_SECRET } =
        process.env;
      const data = qs.stringify({
        username: authDto.username,
        password: authDto.password,
        grant_type: "password",
        client_id: "hasura",
        client_secret: KEYCLOAK_HASURA_CLIENT_SECRET,
      });

      const axiosConfig = {
        method: "post",
        url: `${KEYCLOAK}${KEYCLOAK_USER_TOKEN}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      const res = await this.axiosInstance(axiosConfig);
      // if(dataerror();
      // )
      return response.status(200).send(res.data);
    } catch (error) {
      console.error(error);
      return response
    .status(error.response ? error.response.status : 500)
    .send({ message: error.message });
  }
}

  public async getUserByAuth(request: any, response) {
    let apiId = "api.auth.getUserDetails";
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const username = decoded.preferred_username;
      let data = await this.userService.findUserDetails(null, username);
      return response
        .status(HttpStatus.OK)
        .send(APIResponse.success(apiId, data, "OK"));
    } catch (e) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            "Something went wrong In finding UserDetails",
            e,
            "INTERNAL_SERVER_ERROR"
          )
        );
    }
  }
}
