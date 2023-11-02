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
  Headers,
} from "@nestjs/common";
import { FieldsSearchDto } from "./dto/fields-search.dto";
import { Request } from "@nestjs/common";
import { FieldsDto } from "./dto/fields.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

import { FieldsAdapter } from "./fieldsadapter";

@ApiTags("Fields")
@Controller("fields")
export class FieldsController {
  constructor(private fieldsAdapter: FieldsAdapter) {}

  //create fields
  @Post()
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields has been created successfully." })
  @ApiBody({ type: FieldsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiHeader({
    name: "tenantid",
  })
  public async createFields(
    @Headers() headers,
    @Req() request: Request,
    @Body() fieldsDto: FieldsDto
  ) {
    let tenantid = headers["tenantid"];
    const payload = {
      TenantId: tenantid,
    };
    Object.assign(fieldsDto, payload);

    return this.fieldsAdapter
      .buildFieldsAdapter()
      .createFields(request, fieldsDto);
  }

  //get fields
  @Get("/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async getFields(
    @Headers() headers,
    @Param("id") fieldsId: string,
    @Req() request: Request
  ) {
    let tenantid = headers["tenantid"];
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .getFields(tenantid, fieldsId, request);
  }

  //search
  @Post("/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields list." })
  @ApiBody({ type: FieldsSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  @ApiHeader({
    name: "tenantid",
  })
  public async searchFields(
    @Headers() headers,
    @Req() request: Request,
    @Body() fieldsSearchDto: FieldsSearchDto
  ) {
    let tenantid = headers["tenantid"];
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .searchFields(tenantid, request, fieldsSearchDto);
  }

  /*
  @Put("/:id")
  @ApiConsumes("multipart/form-data")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields has been updated successfully." })
  @ApiBody({ type: FieldsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async updateFields(
    @Param("id") fieldsId: string,
    @Req() request: Request,
    @Body() fieldsDto: FieldsDto,
    @UploadedFile() image
  ) {
    const response = {
      image: image?.filename,
    };
    Object.assign(fieldsDto, response);

    return this.fieldsAdapter
      .buildFieldsAdapter()
      .updateFields(fieldsId, request, fieldsDto);
  }

  @Get(":fieldsId/participants")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Fields detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async findMembersOfFields(
    @Param("fieldsId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .findMembersOfFields(id, role, request);
  }

  @Get("participant/:userId")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Fields detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async getFieldssByUserId(
    @Param("userId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .findFieldssByUserId(id, role, request);
  }

  @Get(":fieldsId/child")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiOkResponse({ description: "Fields detail." })
  @ApiForbiddenResponse({ description: "Forbidden" })
  public async findMembersOfChildFields(
    @Param("fieldsId") id: string,
    @Query("role") role: string,
    @Req() request: Request
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .findMembersOfChildFields(id, role, request);
  }*/
}
