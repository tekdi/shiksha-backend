import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PostgresRoleService } from "src/adapters/postgres/rbac/role-adapter";
import { UserAdapter } from "src/user/useradapter";
// import { UsersService } from '../users/users.service';

@Injectable()
export class AuthRbacService {
  issuer: string;
  audience: string;
  jwt_expires_In: any;
  jwt_secret: any;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userAdapter: UserAdapter,
    private readonly postgresRoleService: PostgresRoleService
  ) {
    this.issuer = this.configService.get<string>("ISSUER");
    this.audience = this.configService.get<string>("AUDIENCE");
    this.jwt_expires_In = this.configService.get("RBAC_JWT_EXPIRES_IN");
    this.jwt_secret = this.configService.get<string>("RBAC_JWT_SECRET");
  } // private usersService: UsersService,

  async generateToken(payload) {
    const plainObject = JSON.parse(JSON.stringify(payload));
    const token = await this.jwtService.signAsync(plainObject, {
      secret: this.jwt_secret,
      expiresIn: this.jwt_expires_In,
    });
    return token;
  }

  async signInRbac(username: string, tenantId: string): Promise<any> {
    let userData = await this.userAdapter
      .buildUserAdapter()
      .findUserDetails(null, username);

    // console.log(userData, "user Id");

    if (!userData) {
      throw new UnauthorizedException();
    }

    userData["roles"] = await this.postgresRoleService.findUserRoleData(
      userData?.userId,
      tenantId
    );

    userData["priviledges"] = await this.getPrivileges(userData.roles);
    userData["tenantId"] = tenantId;
    // console.log(userData, "roleDta");

    const issuer = this.issuer;
    const audience = this.audience;

    const payload = {
      userData,
      iss: issuer,
      aud: audience,
    };

    return {
      access_token: await this.generateToken(payload),
    };
  }

  async getPrivileges(userRoleData) {
    const roleIds = userRoleData.map(({ roleid }) => roleid);
    if (!roleIds.length) {
      return [];
    }
    const privileges = await this.postgresRoleService.findPrivilegeByRoleId(
      roleIds
    );
    return privileges;
  }
}
