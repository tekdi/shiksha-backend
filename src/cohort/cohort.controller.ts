import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiConsumes,
  ApiHeader,
} from "@nestjs/swagger";
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
  Query,
  CacheInterceptor,
  UploadedFile,
  Res,
  Headers,
} from "@nestjs/common";
import { CohortSearchDto } from "./dto/cohort-search.dto";
import { Request } from "@nestjs/common";
import { CohortDto } from "./dto/cohort.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { diskStorage } from "multer";

import { CohortAdapter } from "./cohortadapter";

@ApiTags("Cohort")
@Controller("cohort")
export class CohortController {
  constructor(private cohortAdapter: CohortAdapter) {}

  //test
  @Get("/test")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort Test API" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async testCohort(@Req() request: Request, @Res() response: Response) {
    return this.cohortAdapter
      .buildCohortAdapter()
      .testCohort(request, response);
  }

  //create cohort
  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been created successfully." })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortDto: CohortDto,
    @UploadedFile() image
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      image: image?.filename,
      TenantId: tenantid,
    };
    Object.assign(cohortDto, payload);

    return this.cohortAdapter
      .buildCohortAdapter()
      .createCohort(request, cohortDto);
  }

  //get cohort
  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getCohort(
    @Headers() headers,
    @Param("id") cohortId: string,
    @Req() request: Request
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortAdapter
      .buildCohortAdapter()
      .getCohort(tenantid, cohortId, request);
  }

  //search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort list." })
  @ApiBody({ type: CohortSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortSearchDto: CohortSearchDto
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortAdapter
      .buildCohortAdapter()
      .searchCohort(tenantid, request, cohortSearchDto);
  }
  /*
  @Put("/:id")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been updated successfully." })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: CohortDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohort(
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Body() cohortDto: CohortDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(cohortDto, response);

    return this.cohortAdapter
      .buildCohortAdapter()
      .updateCohort(cohortId, request, cohortDto);
  }

  @Get(":cohortId/participants")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async findMembersOfCohort(
    @Param("cohortId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.cohortAdapter
      .buildCohortAdapter()
      .findMembersOfCohort(id, role, request);
  }

  @Get("participant/:userId")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async getCohortsByUserId(
    @Param("userId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.cohortAdapter
      .buildCohortAdapter()
      .findCohortsByUserId(id, role, request);
  }

  @Get(":cohortId/child")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Cohort detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async findMembersOfChildCohort(
    @Param("cohortId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.cohortAdapter
      .buildCohortAdapter()
      .findMembersOfChildCohort(id, role, request);
  }*/
}
