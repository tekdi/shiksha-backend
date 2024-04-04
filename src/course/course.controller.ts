import {
  ApiExcludeController,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
  Query,
  Param,
  Req,
  Request,
  Inject,
} from "@nestjs/common";

import { DikshaCourseToken } from "src/adapters/diksha/dikshaCourse.adapter";
import { IServicelocator } from "src/adapters/courseservicelocator";

// @ApiTags("Course")
@ApiExcludeController()
@Controller("course")
export class CourseController {
  constructor(
    @Inject(DikshaCourseToken) private dikshaProvider: IServicelocator
  ) {}

  @Get(":adapter/search")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({ description: "Get all Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "subject", required: false })
  @ApiQuery({ name: "audience", required: false })
  @ApiQuery({ name: "className", required: false })
  @ApiQuery({ name: "medium", required: false })
  @ApiQuery({ name: "limit", required: false })
  public async getAllCourse(
    @Param("adapter") adapter: string,
    @Query("subject") subject: [string],
    @Query("audience") audience: [string],
    @Query("className") className: [string],
    @Query("medium") medium: [string],
    @Query("limit") limit: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getAllCourse(
        subject,
        audience,
        className,
        medium,
        limit,
        request
      );
    }
  }

  @Get(":adapter/courseIds")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({ description: "Get all Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseIds", required: false })
  public async getCoursesByIds(
    @Param("adapter") adapter: string,
    @Query("courseIds") courseIds: [string],
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCoursesByIds(courseIds, request);
    }
  }
  @Get(":adapter/hierarchy/courseid")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({ description: "Get Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseId", required: false })
  public async getCourseHierarchy(
    @Param("adapter") adapter: string,
    @Query("courseId") courseId: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCourseHierarchy(courseId, request);
    }
  }

  @Get(":adapter/content/courseid")
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOkResponse({ description: "Get Course detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @ApiQuery({ name: "courseId", required: false })
  public async getCourseDetail(
    @Param("adapter") adapter: string,
    @Query("courseId") courseId: string,
    @Req() request: Request
  ) {
    if (adapter === "diksha") {
      return this.dikshaProvider.getCourseDetail(courseId, request);
    }
  }
}
