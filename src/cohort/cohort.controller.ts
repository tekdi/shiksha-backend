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
  Delete,
  UseGuards,
} from "@nestjs/common";
import { CohortSearchDto } from "./dto/cohort-search.dto";
import { Request } from "@nestjs/common";
import { CohortDto } from "./dto/cohort.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { diskStorage } from "multer";
import { Response, response } from "express";
import { CohortAdapter } from "./cohortadapter";
import { CohortCreateDto } from "./dto/cohort-create.dto";
import { CohortService } from "./cohort.service";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";
// import { FieldsService } from "../fields/fields.service";
@ApiTags("Cohort")
@Controller("cohort")
@UseGuards(JwtAuthGuard)
export class CohortController {
  constructor(
    private cohortAdapter: CohortAdapter,
    private readonly cohortService: CohortService
  ) { }
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
  @ApiBody({ type: CohortCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createCohort(
    @Headers() headers,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      image: image?.filename,
      tenantId: tenantid,
    };
    Object.assign(cohortCreateDto, payload);

    return this.cohortService.createCohort(request, cohortCreateDto);
  }

  @Get("cohortList/:id")
  @UseInterceptors(CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getCohortList(
    @Headers() headers,
    @Param("id") id: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    console.log(request);
    return this.cohortService.getCohortList(tenantid, id, request, response);
  }

  @Get("cohortDetails/:id")
  @UseInterceptors(CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort details" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getCohortDetails(
    @Headers() headers,
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortService.getCohortsDetails(tenantid, cohortId, request, response);
  }

  // search
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
    @Body() cohortSearchDto: CohortSearchDto,
  ) {
    let tenantid = headers["tenantid"];
    return this.cohortService.searchCohort(tenantid, request, cohortSearchDto);
  }

  //update
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
  @ApiBody({ type: CohortCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohort(
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(cohortCreateDto, response);

    return this.cohortService.updateCohort(cohortId, request, cohortCreateDto);

  }

  //delete cohort
  @Delete("/:id")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Cohort has been deleted successfully." })
  @ApiBody({ type: CohortCreateDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateCohortStatus(
    @Param("id") cohortId: string,
    @Req() request: Request,
    @Body() cohortCreateDto: CohortCreateDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(cohortCreateDto, response);

    return this.cohortService.updateCohortStatus(cohortId);

  }

}
