import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AuthDto } from "src/auth/dto/auth-dto";

@Injectable()
export class HasuraAuthService {
  axios = require("axios");

  constructor(private httpService: HttpService) {}

  public async login(request: any, response: any, loginDto: AuthDto) {
    const qs = require("qs");
    console.log(loginDto);
    const data = qs.stringify({
      username: loginDto.username,
      password: loginDto.password,
      grant_type: "password",
      client_id: "hasura",
      client_secret: process.env.KEYCLOAK_HASURA_CLIENT_SECRET,
    });
    console.log(data);
    const config = {
      method: "post",
      url: process.env.KEYCLOAK + process.env.KEYCLOAK_USER_TOKEN,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const res = await this.axios(config);
      return response.status(200).send(res.data);
    } catch (error) {
      console.error(error, "err");
      return error;
    }
  }
}
