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

import { SuccessResponse } from "src/success-response";
import { UserDto } from "./dto/user.dto";
import { UserSearchDto } from "./dto/user-search.dto";
import { UserAdapter } from "./useradapter";
import { UserCreateDto } from "./dto/user-create.dto";
import { ImportCsvDto } from "./dto/user-import-csv.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import csvParser from 'csv-parser';
import * as fs from 'fs';
import * as winston from 'winston';
import { ErrorResponse } from "src/error-response";


const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'import_user.log' }) // Log file for import
  ]
});

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

  // IMPORT CSV FILE
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
    // logger.info("Received file: " + file.originalname);

    

      const csvData = file.buffer.toString('utf-8').trim();
      const lines = csvData.split('\n');
      
      // // Skip the first line (header) and process the rest
      // const data = lines.slice(1).map(line => {
      //   const [name, username, fieldValues, password, role, tenantId] = line.split(',');
      //   return {
      //     name,
      //     username,
      //     fieldValues,
      //     password,
      //     role,
      //     tenantId
      //   };
      // });

      //ferch all fields 
      const headersData = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const rowData = {};
        headersData.forEach((headersData, index) => {
          rowData[headersData] = values[index];
        });
        return rowData;
      });
  
      var count = 1;
      let success =0;
      let error =0;
      // Process each data item
      const contextValue = importCsvDto.context;
      
      
      for (const item of data) {
        await this.userAdapter          
          try {
            const response = await this.userAdapter.buildUserAdapter().checkAndAddUser(request, item);
            
            if (response instanceof ErrorResponse) {
              await logger.info(`${count}. ${item.username} : ${response.errorMessage} `);
              error++;
            }else{
              if(!response.data.username){
                await logger.info(`${count}. ${item.username} : User imported successfully `);
                success++
              }else{
                await logger.info(`${count}. ${item.username} : User already exist.`);
                error++;
              }
            }

          } catch (error) {
            await logger.error(`${count}. ${item.username} : Error importing user ${error.message}`);
          }
          count ++;
      }
      return new SuccessResponse({
        statusCode: 200,
        message: `Success: ${success} records imported successfully. ${error ? `Encountered ${error} errors during import.` : 'No errors encountered.'}`
      });
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
