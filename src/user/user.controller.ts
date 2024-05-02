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
  UsePipes,
  ValidationPipe,
  HttpStatus,
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
  ApiHeader,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";

import { UserSearchDto } from "./dto/user-search.dto";
import { UserAdapter } from "./useradapter";
import { UserCreateDto } from "./dto/user-create.dto";
import { UserUpdateDTO } from "./dto/user-update.dto";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { Response } from "express";
import { isUUID } from "class-validator";
import { SuccessResponse } from "src/success-response";
@ApiTags("User")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(
    private userAdapter: UserAdapter,
  ) {}

  @Get('/:userId')
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "User detais Fetched Succcessfully" })
  @ApiNotFoundResponse({ description: "User Not Found" })
  @ApiInternalServerErrorResponse({description:"Internal Server Error" })
  @ApiBadRequestResponse({description:"Bad Request"})
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid", })
  @ApiQuery({ name: 'fieldvalue', description: 'Send True to Fetch Custom Field of User', required: false })
  public async getUser(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Param("userId") userId: string,
    @Query("fieldvalue") fieldvalue: string | null = null
  ) {
    // const tenantId = headers["tenantid"];   Can be Used In future
    // Context and ContextType can be taken from .env later
    let userData = {
      context: "USERS",
      userId: userId,
      fieldValue: fieldvalue
    }
    let result;
    result = await this.userAdapter.buildUserAdapter().getUsersDetailsById(userData, response);
    return response.status(result.statusCode).json(result);
  }


  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User has been created successfully." })
  @ApiBody({ type: UserCreateDto })
  @ApiForbiddenResponse({ description: "User Already Exists"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error" })
  // @ApiHeader({
  //   name: "tenantid",
  // })
  async createUser(
    // @Headers() headers,
    @Req() request: Request,
    @Body() userCreateDto: UserCreateDto,
    @Res() response: Response
  ) {
    // userCreateDto.tenantId = headers["tenantid"];
    const result = await this.userAdapter.buildUserAdapter().createUser(request, userCreateDto);
    return response.status(result.statusCode).json(result);
  }

  @Patch("/:userid")
  @UseGuards(JwtAuthGuard)
  @ApiBasicAuth("access-token")
  @ApiBody({ type: UserUpdateDTO })
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
    const result = await this.userAdapter.buildUserAdapter().updateUser(userUpdateDto,response);
    return response.status(result.statusCode).json(result);
  }

  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "User list." })
  @ApiBody({ type: UserSearchDto })
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
    const result = await this.userAdapter.buildUserAdapter().searchUser(tenantId,request,response,userSearchDto);
    return response.status(result.statusCode).json(result);
  }

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
