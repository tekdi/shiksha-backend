import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
// import { UsersService } from '../users/users.service';

@Injectable()
export class AuthRbacService {
  issuer: string;
  audience: string;
  jwt_expires_In: any;
  jwt_secret: any;
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
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

  async signInRbac(userId: string): Promise<any> {
    console.log(userId, "user Id");
    const issuer = this.issuer;
    const audience = this.audience;
    const user = {
      username: "admin",
      userId: "1",
      email: "admin@yopmail.com",
      name: "admin",
      roles: ["admin", "teacher"],
      privileges: ["user.create", "attendance.create"],
      tenantId: "ef99949b-7f3a-4a5f-806a-e67e683e38f3",
    };
    // if (user?.password !== pass) {
    //   throw new UnauthorizedException();
    // }
    // TODO: Generate a JWT and return it here
    // instead of the user object

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = {
      user,
      iss: issuer,
      aud: audience,
    };

    // console.log(payload, "auth -payload");

    return {
      access_token: await this.generateToken(payload),
    };
  }
}
