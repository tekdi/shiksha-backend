import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  CacheInterceptor,
  Inject,
  Query,
  Headers,
  Res,
} from "@nestjs/common";
import {
  SunbirdUserToken,
} from "../adapters/sunbirdrc/user.adapter";
import { Request, Response } from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiQuery,
  ApiConsumes,
  ApiHeader,
} from "@nestjs/swagger";

import { UserDto } from "./dto/user.dto";
import { UserSearchDto } from "./dto/user-search.dto";
import { UserAdapter } from "./useradapter";
import { UserCreateDto } from "./dto/user-create.dto";
import { UserService } from "./user.service";
@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly service: UserService,
    private userAdapter: UserAdapter,
    private userService:UserService
  ) {}

  
  /**
	 * Method to get The User Details and Custome Fields Data.
	 *
	 * @param   userId    $data     User Id of User
	 *
	 * @return  UserData Object containing all teh detals
	 *
	 * @since   1.6
	 */
  @Get("/:userid")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getUser(
    @Headers() headers,
    @Param("userid") userId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    // const tenantId = headers["tenantid"];   Can be Used In future
    // Context and ContextType can be taked from .env later
    let userData  = {
      userId:userId,
      context:"USERS",
      contextType:"TEACHER"
    }
    return this.userService.getUsersDetailsById(userData,response);
  }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getUserByAuth(@Headers() headers, @Req() request: Request) {
    const tenantId = headers["tenantid"];
    return this.userAdapter.buildUserAdapter().getUserByAuth(tenantId, request);
  }

  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been created successfully." })
  @ApiBody({ type: UserCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  async createUser(
    @Headers() headers,
    @Req() request: Request,
    @Res() response:Response,
    @Body() userCreateDto: UserCreateDto
  ) {
    userCreateDto.tenantId = headers["tenantid"];
    return this.userService.createUser(request, userCreateDto,response);
  }
  
  @Put("/:userid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been updated successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async updateUser(
    @Headers() headers,
    @Param("userid") userId: string,
    @Req() request: Request,
    @Body() userDto: UserCreateDto
  ) {
    userDto.tenantId = headers["tenantid"];
    return await this.userAdapter
      .buildUserAdapter()
      .updateUser(userId, request, userDto);
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User list." })
  @ApiBody({ type: UserSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchUser(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Body() userSearchDto: UserSearchDto
  ) {
    const tenantId = headers["tenantid"];
    return await this.userAdapter
      .buildUserAdapter()
      .searchUser(tenantId, request, response, userSearchDto);
  }

  @Post("/reset-password")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Password reset successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: Object })
  @UseInterceptors(ClassSerializerInterceptor)
  public async resetUserPassword(
    @Req() request: Request,
    @Body()
    reqBody: {
      username: string;
      newPassword: string;
    }
  ) {
    return await this.userAdapter
      .buildUserAdapter()
      .resetUserPassword(request, reqBody.username, reqBody.newPassword);
  }


}
