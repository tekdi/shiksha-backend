// import {
//   ApiTags,
//   ApiForbiddenResponse,
//   ApiCreatedResponse,
//   ApiBasicAuth,
//   ApiBody,
//   ApiQuery,
//   ApiOkResponse,
// } from "@nestjs/swagger";
// import {
//   Controller,
//   Get,
//   Param,
//   UseInterceptors,
//   ClassSerializerInterceptor,
//   SerializeOptions,
//   Req,
//   Request,
//   CacheInterceptor,
//   Post,
//   Body,
//   Query,
//   Put,
// } from "@nestjs/common";
// import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";
// import { CourseTrackingDto } from "./dto/courseTracking.dto";

// @ApiTags("Course Tracking")
// @Controller("coursetracking")
// export class CourseTrackingController {
//   constructor(private service: CourseTrackingService) {}

//   @Post()
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({
//     description: "Course Tracking has been created successfully.",
//   })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @ApiQuery({ name: "progressDetail", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "contentIds", required: false })
//   @ApiQuery({ name: "startTime", required: false })
//   @ApiQuery({ name: "endTime", required: false })
//   @ApiQuery({ name: "certificate", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async createCourse(
//     @Req() request: Request,
//     @Query("progressDetail") progressDetail: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("contentIds") contentIds: string,
//     @Query("startTime") startTime: string,
//     @Query("endTime") endTime: string,
//     @Query("certificate") certificate: string,
//     @Query("status") status: string,
//     @Query("source") source: string
//   ) {
//     return this.service.createCourseTracking(
//       request,
//       progressDetail,
//       courseId,
//       userId,
//       contentIds,
//       startTime,
//       endTime,
//       certificate,
//       status,
//       source
//     );
//   }

//   @Get("/:id")
//   @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({ description: "Course Tracking detail" })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @SerializeOptions({
//     strategy: "excludeAll",
//   })
//   public async getCourseTracking(
//     @Param("id") courseTrackingId: string,
//     @Req() request: Request
//   ) {
//     return this.service.getCourseTracking(courseTrackingId, request);
//   }

//   @Put("/:id")
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({
//     description: "Course Tracking has been updated successfully.",
//   })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @ApiQuery({ name: "progressDetail", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "contentIds", required: false })
//   @ApiQuery({ name: "startTime", required: false })
//   @ApiQuery({ name: "endTime", required: false })
//   @ApiQuery({ name: "certificate", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async updateTracking(
//     @Param("id") courseTrackingId: string,
//     @Req() request: Request,
//     @Query("progressDetail") progressDetail: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("contentIds") contentIds: string,
//     @Query("startTime") startTime: string,
//     @Query("endTime") endTime: string,
//     @Query("certificate") certificate: string,
//     @Query("status") status: string,
//     @Query("source") source: string
//   ) {
//     return await this.service.updateCourseTracking(
//       request,
//       courseTrackingId,
//       progressDetail,
//       courseId,
//       userId,
//       contentIds,
//       startTime,
//       endTime,
//       certificate,
//       status,
//       source
//     );
//   }

//   @Post("/search")
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({ description: "Course Tracking list." })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @SerializeOptions({
//     strategy: "excludeAll",
//   })
//   @ApiQuery({ name: "limit", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "page", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async searchCourseTracking(
//     @Query("limit") limit: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("status") status: string,
//     @Query("page") page: number,
//     @Query("source") source: string,
//     @Req() request: Request
//   ) {
//     return await this.service.searchCourseTracking(
//       limit,
//       courseId,
//       userId,
//       status,
//       page,
//       source,
//       request
//     );
//   }
// }


// import {
//   ApiTags,
//   ApiForbiddenResponse,
//   ApiCreatedResponse,
//   ApiBasicAuth,
//   ApiBody,
//   ApiQuery,
//   ApiOkResponse,
// } from "@nestjs/swagger";
// import {
//   Controller,
//   Get,
//   Param,
//   UseInterceptors,
//   ClassSerializerInterceptor,
//   SerializeOptions,
//   Req,
//   Request,
//   CacheInterceptor,
//   Post,
//   Body,
//   Query,
//   Put,
// } from "@nestjs/common";
// import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";
// import { CourseTrackingDto } from "./dto/courseTracking.dto";

// @ApiTags("Course Tracking")
// @Controller("coursetracking")
// export class CourseTrackingController {
//   constructor(private service: CourseTrackingService) {}

//   @Post()
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({
//     description: "Course Tracking has been created successfully.",
//   })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @ApiQuery({ name: "progressDetail", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "contentIds", required: false })
//   @ApiQuery({ name: "startTime", required: false })
//   @ApiQuery({ name: "endTime", required: false })
//   @ApiQuery({ name: "certificate", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async createCourse(
//     @Req() request: Request,
//     @Query("progressDetail") progressDetail: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("contentIds") contentIds: string,
//     @Query("startTime") startTime: string,
//     @Query("endTime") endTime: string,
//     @Query("certificate") certificate: string,
//     @Query("status") status: string,
//     @Query("source") source: string
//   ) {
//     return this.service.createCourseTracking(
//       request,
//       progressDetail,
//       courseId,
//       userId,
//       contentIds,
//       startTime,
//       endTime,
//       certificate,
//       status,
//       source
//     );
//   }

//   @Get("/:id")
//   @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({ description: "Course Tracking detail" })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @SerializeOptions({
//     strategy: "excludeAll",
//   })
//   public async getCourseTracking(
//     @Param("id") courseTrackingId: string,
//     @Req() request: Request
//   ) {
//     return this.service.getCourseTracking(courseTrackingId, request);
//   }

//   @Put("/:id")
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({
//     description: "Course Tracking has been updated successfully.",
//   })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @ApiQuery({ name: "progressDetail", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "contentIds", required: false })
//   @ApiQuery({ name: "startTime", required: false })
//   @ApiQuery({ name: "endTime", required: false })
//   @ApiQuery({ name: "certificate", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async updateTracking(
//     @Param("id") courseTrackingId: string,
//     @Req() request: Request,
//     @Query("progressDetail") progressDetail: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("contentIds") contentIds: string,
//     @Query("startTime") startTime: string,
//     @Query("endTime") endTime: string,
//     @Query("certificate") certificate: string,
//     @Query("status") status: string,
//     @Query("source") source: string
//   ) {
//     return await this.service.updateCourseTracking(
//       request,
//       courseTrackingId,
//       progressDetail,
//       courseId,
//       userId,
//       contentIds,
//       startTime,
//       endTime,
//       certificate,
//       status,
//       source
//     );
//   }

//   @Post("/search")
//   @ApiBasicAuth("access-token")
//   @ApiCreatedResponse({ description: "Course Tracking list." })
//   @ApiForbiddenResponse({ description: "Forbidden" })
//   @UseInterceptors(ClassSerializerInterceptor)
//   @SerializeOptions({
//     strategy: "excludeAll",
//   })
//   @ApiQuery({ name: "limit", required: false })
//   @ApiQuery({ name: "courseId", required: false })
//   @ApiQuery({ name: "userId", required: false })
//   @ApiQuery({ name: "status", required: false })
//   @ApiQuery({ name: "page", required: false })
//   @ApiQuery({ name: "source", required: false })
//   public async searchCourseTracking(
//     @Query("limit") limit: string,
//     @Query("courseId") courseId: string,
//     @Query("userId") userId: string,
//     @Query("status") status: string,
//     @Query("page") page: number,
//     @Query("source") source: string,
//     @Req() request: Request
//   ) {
//     return await this.service.searchCourseTracking(
//       limit,
//       courseId,
//       userId,
//       status,
//       page,
//       source,
//       request
//     );
//   }
// }

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
  Request,
  CacheInterceptor,
  Inject,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { request } from "http";
// import { ALTCourseTrackingService } from "../adapters/hasura/altCourseTracking.adapter";
import { CourseTrackingService } from "src/adapters/hasura/courseTracking.adapter";

// import { ALTCourseTrackingDto } from "./dto/altCourseTracking.dto";
// import { ALTCourseTrackingSearch } from "./dto/searchaltCourseTracking.dto";
// import { UpdateALTCourseTrackingDto } from "./dto/updatealtCourseTracking.dto";
import { CourseTrackingDto } from "src/courseTracking/dto/courseTracking.dto";
import { UpdateALTCourseTrackingDto } from "src/courseTracking/dto/updateCourseTracking.dto";
import { ALTCourseTrackingSearch } from "src/courseTracking/dto/searchCourseTracking.dto";

@ApiTags("ALT Course Tracking")
@Controller("alt-course-tracking")
export class ALTCourseTrackingController {
  constructor(private altCourseTrackingService: CourseTrackingService) {}

  @Get("/altcoursetrackingdetails")
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "ALT Course Tracking Details" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({
    name: "userId",
    type: String,
    description: "A parameter. Optional",
    required: false,
  })
  @ApiQuery({ name: "courseid" })
  public async getCourseDetails(
    @Req() request: Request,
    @Query("courseid") courseId: string,
    @Query("userId") userId?: string
  ) {
    return this.altCourseTrackingService.getExistingCourseTrackingRecords(
      request,
      courseId,
      userId
    );
  }

  @Post("/addcoursetracking")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "ALTCourseTrack has been created successfully.",
  })
  @ApiBody({ type: CourseTrackingDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createALTCourseTracking(
    @Req() request: Request,
    @Query("modulestatus") moduleStatus: string,
    @Body() altCourseTrackingDto: CourseTrackingDto
  ) {
    const res = this.altCourseTrackingService.addALTCourseTracking(
      request,
      altCourseTrackingDto,
      moduleStatus
    );

    return res;
  }

  @Patch("/altupdatecoursetracking/")
  @ApiBasicAuth("access-token")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBody({ type: UpdateALTCourseTrackingDto })
  @ApiCreatedResponse({
    description: "ALTCourseTrack has been updated successfully.",
  })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async updateALTCourseTracking(
    @Req() request: Request,
    @Body() updateALtCourseTrackingDto: UpdateALTCourseTrackingDto
  ) {
    const res = this.altCourseTrackingService.updateALTCourseTracking(
      request,
      updateALtCourseTrackingDto
    );

    return res;
  }

  @Post("/search/:userid")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Course list." })
  @ApiBody({ type: ALTCourseTrackingSearch })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchaltCourseTracking(
    @Req() request: Request,
    @Param("userid") userId: string,
    @Body() altCourseTrackingSearch: ALTCourseTrackingSearch
  ) {
    return this.altCourseTrackingService.searchALTCourseTracking(
      request,
      userId,
      altCourseTrackingSearch
    );
  }
}


