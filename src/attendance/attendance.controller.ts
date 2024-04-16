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
  Request,
  UploadedFile,
  Headers,
  UsePipes,
  ValidationPipe,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AttendanceDto, BulkAttendanceDTO } from "./dto/attendance.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { AttendanceSearchDto } from "./dto/attendance-search.dto";
import { AttendaceAdapter } from "./attendanceadapter";
import { AttendanceDateDto } from "./dto/attendance-date.dto";
import { AttendanceStatsDto } from "./dto/attendance-stats.dto";
import { Response } from "express";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";

@ApiTags("Attendance")
@Controller("attendance")
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(
    private attendaceAdapter: AttendaceAdapter,
  ) {}

  // @Get("/:id")
  // @UseInterceptors(ClassSerializerInterceptor)
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Attendance detail" })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  // @SerializeOptions({
  //   strategy: "excludeAll",
  // })
  // @ApiHeader({
  //   name: "tenantid",
  // })
  // public async getAttendance(
  //   @Headers() headers,
  //   @Param("id") attendanceId: string,
  //   @Req() request: Request
  // ) {
  //   let tenantid = headers["tenantid"];
  //   return await this.attendaceAdapter
  //     .buildAttenceAdapter()
  //     .getAttendance(tenantid, attendanceId, request);
  // }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Attendance has been created successfully.",
  })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: process.env.IMAGEPATH,
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: AttendanceDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  @UsePipes(ValidationPipe)
  public async createAttendace(
    @Headers() headers,
    @Req() request: Request,
    @Body() attendanceDto: AttendanceDto,
    @Res() response: Response,
    @UploadedFile() image
  ) {
    attendanceDto.tenantId = headers["tenantid"];
    attendanceDto.image = image?.filename;
    const result = await this.attendaceAdapter.buildAttenceAdapter().updateAttendanceRecord(
      request,
      attendanceDto
    );
    return response.status(result.statusCode).json(result);
  }

  @Put("/:id")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Attendance has been Updated successfully.",
  })
  @UseInterceptors(
    FileInterceptor("image", {
      storage: diskStorage({
        destination: "./uploads",
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    })
  )
  @ApiBody({ type: AttendanceDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  public async updateAttendace(
    @Param("id") attendanceId: string,
    @Req() request: Request,
    @Body() attendanceDto: AttendanceDto,
    @Res() response: Response,
    @UploadedFile() image
  ) {
    const Imageresponse = {
      image: image?.filename,
    };
    Object.assign(attendanceDto, response);
    const result = this.attendaceAdapter.buildAttenceAdapter().updateAttendance(
      attendanceId,
      request,
      attendanceDto
    );
    return response.status(result.statusCode).json(result);
  }


  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Attendance list." })
  @ApiBody({ type: AttendanceSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  // @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(ValidationPipe)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchAttendanceNew(
    @Headers() headers,
    @Req() request: Request,
    @Body() studentSearchDto: AttendanceSearchDto,
    @Res() response: Response
  ) {
    let tenantid = headers["tenantid"];

    const result = await this.attendaceAdapter.buildAttenceAdapter().searchAttendance(
      tenantid,
      request,
      studentSearchDto
    );
    return response.status(result.statusCode).json(result);
  }

  @Post("/bydate")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: " Ok." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({
    name: "tenantid",
  })
  @UsePipes(ValidationPipe)
  public async attendanceFilter(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Body() attendanceDateDto: AttendanceDateDto
  ) {
    const tenantId = headers["tenantid"];
    const result = await this.attendaceAdapter.buildAttenceAdapter().attendanceByDate(
      tenantId,
      request,
      attendanceDateDto
    );
    return response.status(result.statusCode).json(result);
  }

  @Post("bulkAttendance")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Attendance has been created successfully.",
  })
  @ApiBody({ type: BulkAttendanceDTO })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiHeader({
    name: "tenantid",
  })
  @UsePipes(ValidationPipe)
  public async multipleAttendance(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Body() attendanceDtos: BulkAttendanceDTO
  ) {
    let tenantId = headers["tenantid"];
    const result = await this.attendaceAdapter.buildAttenceAdapter().multipleAttendance(
      tenantId,
      request,
      attendanceDtos
    );
    return response.status(result.statusCode).json(result);
  }

  @Post("/average-report")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Attendance list." })
  @ApiBody({ type: AttendanceStatsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @UsePipes(ValidationPipe)
  public async report(
    @Headers() headers,
    @Req() request: Request,
    @Res() response: Response,
    @Body() attendanceStatsDto: AttendanceStatsDto
  ) {
    let tenantid = headers["tenantid"];

    const result = await this.attendaceAdapter.buildAttenceAdapter().attendanceReport(
      attendanceStatsDto
    );
    return response.status(result.statusCode).json(result);
  }

  /** No longer required in Shiksha 2.0 */
  /*
  @Get("usersegment/:attendance")
  @UseInterceptors(ClassSerializerInterceptor)
  // @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: " Ok." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "groupId", required: false })
  @ApiQuery({ name: "date" })
  public async userSegment(
    @Query("groupId") groupId: string,
    @Param("attendance") attendance: string,
    @Query("date") date: string,
    @Req() request: Request
  ) {
    return await this.service.userSegment(groupId, attendance, date, request);
  }
  */
}
