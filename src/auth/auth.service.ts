import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserAdapter } from "src/user/useradapter";
import axios from "axios";
import jwt_decode from "jwt-decode";
import APIResponse from "src/utils/response";
import { KeycloakService } from "src/common/utils/keycloak.service";


type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
};
@Injectable()
export class AuthService {
  private axiosInstance;
  constructor(
    private readonly useradapter: UserAdapter,
    private readonly keycloakService: KeycloakService
  ) {
    this.axiosInstance = axios.create();
  }

  async login(authDto) {
    const { username, password } = authDto;
    try {
      const {
        access_token,
        expires_in,
        refresh_token,
        refresh_expires_in,
        token_type
      } = await this.keycloakService.login(username, password);
      
      return {
        access_token,
        refresh_token,
        expires_in,
        refresh_expires_in,
        token_type
      };
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new NotFoundException("Invalid username or password");
      } else {
        throw error; 
      }
    }
  }
  


  public async getUserByAuth(request: any, response) {
    let apiId = "api.auth.getUserDetails";
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const username = decoded.preferred_username;
      let data = await this.useradapter.buildUserAdapter().findUserDetails(null, username); 
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

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const { access_token, expires_in, refresh_token, refresh_expires_in } =
      await this.keycloakService.refreshToken(refreshToken).catch(() => {
        throw new UnauthorizedException();
      });

    return {
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
    };
  }

  async logout(refreshToken: string) {
    await this.keycloakService.logout(refreshToken).catch(() => {
      throw new UnauthorizedException();
    });
  }
}
