import {
  CacheInterceptor,
  CACHE_MANAGER,
  Inject,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiBasicAuth,
  ApiExcludeController,
} from "@nestjs/swagger";
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Req,
} from "@nestjs/common";
import { StudentDto } from "./dto/student.dto";
import { StudentSearchDto } from "./dto/student-search.dto";
import { IServicelocator } from "src/adapters/studentservicelocator";
import { StudentAdapter } from "./studentadapter";
// @ApiTags("Student")
@ApiExcludeController()
@Controller("student")
export class StudentController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager,

    private studentAdapter: StudentAdapter
  ) {}

  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  // @ApiBasicAuth("access-token")
  // @ApiOkResponse({ description: "Student detail." })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  getStudent(@Param("id") studentId: string, @Req() request: Request) {
    return this.studentAdapter
      .buildStudentAdapter()
      .getStudent(studentId, request);
  }

  @Post()
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Student has been created successfully." })
  // @ApiBody({ type: StudentDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createStudent(
    @Req() request: Request,
    @Body() studentDto: StudentDto
  ) {
    return this.studentAdapter
      .buildStudentAdapter()
      .createStudent(request, studentDto);
  }

  @Put("/:id")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Student has been updated successfully." })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateStudent(
    @Param("id") id: string,
    @Req() request: Request,
    @Body() studentDto: StudentDto
  ) {
    return await this.studentAdapter
      .buildStudentAdapter()
      .updateStudent(id, request, studentDto);
  }

  @Post("/search")
  // @ApiBasicAuth("access-token")
  // @ApiCreatedResponse({ description: "Student list." })
  // @ApiBody({ type: StudentSearchDto })
  // @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchStudent(
    @Req() request: Request,
    @Body() studentSearchDto: StudentSearchDto
  ) {
    return this.studentAdapter
      .buildStudentAdapter()
      .searchStudent(request, studentSearchDto);
  }
}
