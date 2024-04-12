import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  SerializeOptions,
  Req,
  Headers,
  Res,
  Patch,
  UseGuards,
  Query,
} from "@nestjs/common";

import { Request } from "@nestjs/common";
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
import { UserUpdateDTO } from "./dto/user-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { Response } from "express";
@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private userAdapter: UserAdapter,
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
  @Get()
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid", })
  @ApiQuery({ name: 'userid', description: 'The user ID (optional)', required: false, })
  @ApiQuery({ name: 'cohortid', description: 'The cohort ID (optional)', required: false, })
  @ApiQuery({ name: 'role', description: 'The role (optional)', required: false, })
  @ApiQuery({ name: 'fieldvalue', description: 'The field Value (optional)', required: false })
  public async getUser(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Query("userid") userId: string | null = null,
    @Query("cohortid") cohortId: string | null = null,
    @Query("role") role: string | null = null,
    @Query("fieldvalue") fieldvalue: string | null = null
  ) {

    // const tenantId = headers["tenantid"];   Can be Used In future
    // Context and ContextType can be taken from .env later
    let userData: any = {
      context: "USERS",
      userId: userId && typeof userId === 'string' && userId !== ',' && userId !== '{userid}' ? userId : null,
      cohortId: cohortId && typeof cohortId === 'string' && cohortId !== ',' && cohortId !== '{cohortid}' ? cohortId : null,
      contextType: role && typeof role === 'string' && role !== ',' && role !== '{role}' ? role : null,
      fieldValue: fieldvalue && typeof fieldvalue === 'string' && fieldvalue !== ',' && fieldvalue !== '{fieldvalue}' ? fieldvalue : null
    };

    let result;
    if (userData.userId !== null) {
      result = await this.userAdapter.buildUserAdapter().getUsersDetailsById(
        userData, response);
    }
    else if (userData.cohortId !== null) {
      result = await this.userAdapter.buildUserAdapter().getUsersDetailsByCohortId(
        userData, response);
    }
    if (userData.userId == null && userData.cohortId == null) {
      return response.status(400).json({ 
        statusCode: 400,
        error: "Please entire userId or cohortId in query parameters" 
      });
    }
    
    return response.status(result.statusCode).json(result);
  }

  // @Get()
  // @ApiBasicAuth("access-token")
  // @ApiOkResponse({ description: "User detail." })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  // @ApiHeader({
  //   name: "tenantid",
  // })
  // public async getUserByAuth(@Headers() headers, @Req() request: Request) {
  //   const tenantId = headers["tenantid"];
  //   return this.userAdapter.buildUserAdapter().getUserByAuth(tenantId, request);
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been created successfully." })
  @ApiBody({ type: UserCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  async createUser(
    @Headers() headers,
    @Req() request: Request,
    @Body() userCreateDto: UserCreateDto,
    @Res() response: Response
  ) {
    userCreateDto.tenantId = headers["tenantid"];
    const result = await this.userAdapter.buildUserAdapter().createUser(request, userCreateDto);
    return response.status(result.statusCode).json(result);
  }

  @Patch("/:userid")
  @UseGuards(JwtAuthGuard)
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
    @Body() userUpdateDto: UserUpdateDTO,
    @Res() response: Response
  ) {
    // userDto.tenantId = headers["tenantid"];
    userUpdateDto.userId = userId;
    const result = await this.userAdapter.buildUserAdapter().updateUser(userId,request,userUpdateDto,response);
    return response.status(result.statusCode).json(result);
  }

  // @Post("/search")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "User list." })
  // @ApiBody({ type: UserSearchDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  // @ApiHeader({
  //   name: "tenantid",
  // })
  // public async searchUser(
  //   @Headers() headers,
  //   @Req() request: Request,
  //   @Res() response: Response,
  //   @Body() userSearchDto: UserSearchDto
  // ) {
  //   const tenantId = headers["tenantid"];
  //   return await this.userAdapter
  //     .buildUserAdapter()
  //     .searchUser(tenantId, request, response, userSearchDto);
  // }

  @Post("/reset-password")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Password reset successfully." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiBody({ type: Object })
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
