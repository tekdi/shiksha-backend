// import { AttendanceService } from 'src/adapters/sunbirdrc/attendance.adapter';
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiConsumes,
  ApiQuery,
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
  CacheInterceptor,
  Query,
  Headers,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AttendanceDto, BulkAttendanceDTO } from "./dto/attendance.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from "./utils/file-upload.utils";
import { AttendanceSearchDto } from "./dto/attendance-search.dto";
import { AttendanceHasuraService } from "src/adapters/hasura/attendance.adapter";
import { AttendaceAdapter } from "./attendanceadapter";
import { AttendanceDateDto } from "./dto/attendance-date.dto";
import { AttendanceService } from './attendance.service';
import { AttendanceStatsDto } from "./dto/attendance-stats.dto";

@ApiTags("Attendance")
@Controller("attendance")
export class AttendanceController {
  constructor(
    private service: AttendanceHasuraService,
    private attendaceAdapter: AttendaceAdapter,
    private attendaceService: AttendanceService
  ) { }

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Attendance detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getAttendance(
    @Headers() headers,
    @Param("id") attendanceId: string,
    @Req() request: Request
  ) {
    let tenantid = headers["tenantid"];
    return await this.attendaceAdapter
      .buildAttenceAdapter()
      .getAttendance(tenantid, attendanceId, request);
  }


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
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  @UsePipes(ValidationPipe)
  public async createAttendace(
    @Headers() headers,
    @Req() request: Request,
    @Body() attendanceDto: AttendanceDto,
    @UploadedFile() image
  ) {
    attendanceDto.tenantId = headers["tenantid"];
    attendanceDto.image = image?.filename;
    return this.attendaceService.updateAttendanceRecord(request, attendanceDto);
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
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateAttendace(
    @Param("id") attendanceId: string,
    @Req() request: Request,
    @Body() attendanceDto: AttendanceDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(attendanceDto, response);
    return this.attendaceService
      .updateAttendance(attendanceId, request, attendanceDto);
  }
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Attendance list." })
  @ApiBody({ type: AttendanceSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
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
    @Body() studentSearchDto: AttendanceSearchDto
  ) {
    let tenantid = headers["tenantid"];
    return this.attendaceService
      .searchAttendance(tenantid, request, studentSearchDto);
  }

  @Post("/bydate")
  @UseInterceptors(ClassSerializerInterceptor)
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
    @Body() attendanceDateDto: AttendanceDateDto
  ) {
    const tenantId = headers["tenantid"];
    return this.attendaceService.attendanceByDate(tenantId, request, attendanceDateDto);
  }

  @Post("bulkAttendance")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Attendance has been created successfully.",
  })
  @ApiBody({ type: BulkAttendanceDTO })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  @UsePipes(ValidationPipe)
  public async multipleAttendance(
    @Headers() headers,
    @Req() request: Request,
    @Body() attendanceDtos: BulkAttendanceDTO
  ) {
    let tenantid = headers["tenantid"];
    return this.attendaceService
      .multipleAttendance(tenantid, request, attendanceDtos);
  }

  @Post("/report")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Attendance list." })
  @ApiBody({ type: AttendanceStatsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @UsePipes(ValidationPipe)
  public async report(
    @Headers() headers,
    @Req() request: Request,
    @Body() attendanceStatsDto: AttendanceStatsDto
  ) {
    let tenantid = headers["tenantid"];
    return this.attendaceService
      .attendanceReport(attendanceStatsDto);
  }

  /** No longer required in Shiksha 2.0 */
  /*
  @Get("usersegment/:attendance")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
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
