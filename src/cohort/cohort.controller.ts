import {
  ApiTags,
  ApiBody,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiConsumes,
  ApiHeader,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseInterceptors,
  SerializeOptions,
  Req,
  UploadedFile,
  Res,
  Headers,
  Delete,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { CohortSearchDto } from "./dto/cohort-search.dto";
import { Request } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { diskStorage } from "multer";
import { Response, response } from "express";
import { CohortAdapter } from "./cohortadapter";
import { CohortCreateDto } from "./dto/cohort-create.dto";
import { CohortUpdateDto } from "./dto/cohort-update.dto";

import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
import { QueryParamsDto } from "./dto/query-params.dto";

@ApiTags("Cohort")
@Controller("cohorts")
// @UseGuards(JwtAuthGuard)
export class CohortController {
  constructor(private readonly cohortAdapter: CohortAdapter) { }

  //Get Cohort Details
  @Get("/:cohortId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort detais Fetched Succcessfully" })
  @ApiNotFoundResponse({ description: "Cohort Not Found" })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @ApiBadRequestResponse({description:"Bad Request"})
  @SerializeOptions({ strategy: "excludeAll", })
  @ApiHeader({ name: "tenantid", })
  public async getCohortsDetails(
    @Headers() headers,
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    // const tenantId = headers["tenantid"];   Can be Used In future
    const result = await this.cohortAdapter.buildCohortAdapter().getCohortsDetails(cohortId);
    return response.status(result.statusCode).json(result);
  }

  //create cohort
  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been created successfully." })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  @ApiConflictResponse({description:"Cohort already exists."})

  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: CohortCreateDto })
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image,
    @Res() response: Response
  ) {
    // Define expected fields
    const expectedFields = ['programId', 'parentId', 'name', 'type', 'fieldValues' ]; 

    // Check if any unexpected fields are present in the request body
    const unexpectedFields = Object.keys(cohortCreateDto).filter(field => !expectedFields.includes(field));
    if (unexpectedFields.length > 0) {
      throw new BadRequestException(`Unexpected fields found: ${unexpectedFields.join(', ')}`);
    }
            
    let tenantid = headers["tenantid"];
    const payload = {
      image: image?.filename,
      tenantId: tenantid,
    };
    Object.assign(cohortCreateDto, payload);
    const result = await this.cohortAdapter.buildCohortAdapter().createCohort(
      request,
      cohortCreateDto
    );
    return response.status(result.statusCode).json(result);
  }



  // search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiBody({ type: CohortSearchDto })
  @ApiOkResponse({ description: "Cohort list" })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  // @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe())
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortSearchDto: CohortSearchDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    const result = await this.cohortAdapter.buildCohortAdapter().searchCohort(
      tenantid,
      request,
      cohortSearchDto
    );
    return response.status(result.statusCode).json(result);
  }

  //update
  @Put("/:cohortId")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortUpdateDto })
  @ApiOkResponse({ description: "Cohort has been updated successfully" })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })

  public async updateCohort(
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Body() cohortUpdateDto: CohortUpdateDto,
    @UploadedFile() image,
    @Res() response: Response
  ) {
    const imgresponse = {
      image: image?.filename,
    };
    Object.assign(cohortUpdateDto, imgresponse);

    const result = await this.cohortAdapter.buildCohortAdapter().updateCohort(
      cohortId,
      request,
      cohortUpdateDto
    );
    return response.status(result.statusCode).json(result);
  }


  //delete cohort
  @Delete("/:cohortId")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort has been deleted successfully." })
  @ApiBadRequestResponse({ description: "Bad request." })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error." })
  public async updateCohortStatus(
    @Param("cohortId") cohortId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    const result = await this.cohortAdapter.buildCohortAdapter().updateCohortStatus(cohortId, request);
    return response.status(result.statusCode).json(result);
  }
}
