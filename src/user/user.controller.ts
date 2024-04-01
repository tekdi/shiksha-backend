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
  Patch,
  UseGuards,
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
import { UserUpdateDTO } from "./dto/user-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
@ApiTags("User")
@Controller("user")
@UseGuards(JwtAuthGuard)
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
  @Get("/:userid/:role")
  @UseInterceptors(CacheInterceptor)
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
    @Param("userid") getDataId: string,
    @Param("role") role:string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    // const tenantId = headers["tenantid"];   Can be Used In future
    // Context and ContextType can be taked from .env later

    // Check if getDataId contains '=' indicating it's cohortId
    if (getDataId.includes('=')) {
      const [key, value] = getDataId.split('=');
      if (key === 'cohort') {
      let cohortData = {
          cohortId: value,
          context: "USERS",
          contextType: "TEACHER"
        };
        return this.userService.getUsersDetailsByCohortId(cohortData, response);
      }
    }

    let userData  = {
      userId:getDataId,
      context:"USERS",
      contextType:role
    }
    return this.userService.getUsersDetailsById(userData,response);

  }

  @Get()
  @UseInterceptors(CacheInterceptor)
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
    @Body() userCreateDto: UserCreateDto
  ) {
    userCreateDto.tenantId = headers["tenantid"];
    return this.userService.createUser(request, userCreateDto);
  }
  

  @Patch("/:userid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been updated successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({
    name: "tenantid",
  })
  public async updateUser(
    @Headers() headers,
    @Param("userid") userId: string,
    @Req() request: Request,
    @Body() userUpdateDto:UserUpdateDTO,
    @Res() response: Response
  ) {
    // userDto.tenantId = headers["tenantid"];
    userUpdateDto.userId=userId;
    return await this.userService.updateUser(userUpdateDto,response)
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
