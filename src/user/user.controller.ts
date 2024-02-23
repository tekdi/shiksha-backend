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
  UploadedFile,
} from "@nestjs/common";
import {
  SunbirdUserToken,
  UserService,
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
import { ImportCsvDto } from "./dto/user-import-csv.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import csvParser from 'csv-parser';
import * as fs from 'fs';

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(
    private readonly service: UserService,
    private userAdapter: UserAdapter
  ) {}

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
  @ApiQuery({ name: "accessrole" })
  public async getUser(
    @Headers() headers,
    @Param("userid") userId: string,
    @Query("accessrole") accessRole: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const tenantId = headers["tenantid"];
    return this.userAdapter
      .buildUserAdapter()
      .getUser(tenantId, userId, accessRole, request, response);
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
  public async createUser(
    @Headers() headers,
    @Req() request: Request,
    @Body() userCreateDto: UserCreateDto
  ) {
    userCreateDto.tenantId = headers["tenantid"];
    return this.userAdapter
      .buildUserAdapter()
      .checkAndAddUser(request, userCreateDto);
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


  @Post("/importCsv")
  @UseInterceptors(FileInterceptor('file'))
  @ApiBasicAuth("access-token")
  @ApiBody({ type: ImportCsvDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async importCsv(
    @Req() request: Request,
    @Headers() headers,
    @UploadedFile() file,
    @Body() importCsvDto: ImportCsvDto
  ) {
    console.log("Received file:", file.originalname);
    console.log("File contents:");
    console.log(file.buffer.toString('utf-8'));
    const contextValue = importCsvDto.context;
    console.log("Context value:", contextValue);
    
  }


  // @Post("/importCsv")
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiBasicAuth("access-token")
  // // @ApiBody({ type: UserCreateDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  // @ApiHeader({
  //   name: "tenantid",
  // })
  // public async importCsv(
  //   @Headers() headers,
  //   @UploadedFile() file
  //   // @Body() userCreateDto: UserCreateDto
  // ) {
  //   console.log(file);
  //   // const results = [];
  //   // fs.createReadStream(file.path)
  //   //   .pipe(csvParser())
  //   //   .on('data', (data) => results.push(data))

      
  //     // .on('end', async () => {
  //     //   for (const userData of results) {
  //     //     const user = new User();
  //     //     user.name = userData.name;
  //     //     user.email = userData.email;
  //     //     // set other properties as needed
  //     //     await this.userService.createUser(user);
  //     //   }
  //     // });
  //   // return { message: 'Users imported successfully' };
  

  
  //   // userCreateDto.tenantId = headers["tenantid"];
  //   // return this.userAdapter
  //   //   .buildUserAdapter()
  //   //   .addDataUsingCsv(request);
  // }


  // async importUsers(@UploadedFile() file) {
  //   const results = [];
  //   fs.createReadStream(file.path)
  //     .pipe(csvParser())
  //     .on('data', (data) => results.push(data))
  //     .on('end', async () => {
  //       for (const userData of results) {
  //         const user = new User();
  //         user.name = userData.name;
  //         user.email = userData.email;
  //         // set other properties as needed
  //         await this.userService.createUser(user);
  //       }
  //     });
  //   return { message: 'Users imported successfully' };
  // }
  
  // @ApiSecurity('access-token')
  // @Get('/:id')
  // findUser(@Param('id', ParseIntPipe) id: number){
  //     return this.userService.findUser(id)
  // }

}
