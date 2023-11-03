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
import { FieldValuesDto } from "./dto/field-values.dto";
import { FieldValuesSearchDto } from "./dto/field-values-search.dto";

@ApiTags("Fields")
@Controller("fields")
export class FieldsController {
  constructor(private fieldsAdapter: FieldsAdapter) {}

  //fields
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
      tenantId: tenantid,
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

  //update
  @Put("/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields has been updated successfully." })
  @ApiBody({ type: FieldsDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async updateFields(
    @Param("id") fieldsId: string,
    @Req() request: Request,
    @Body() fieldsDto: FieldsDto
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .updateFields(fieldsId, request, fieldsDto);
  }

  //field values
  //create fields values
  @Post("/values")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Fields Values has been created successfully.",
  })
  @ApiBody({ type: FieldValuesDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  public async createFieldValues(
    @Req() request: Request,
    @Body() fieldValuesDto: FieldValuesDto
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .createFieldValues(request, fieldValuesDto);
  }

  //get fields values
  @Get("/values/:id")
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields Values detail" })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async getFieldValues(
    @Param("id") id: string,
    @Req() request: Request
  ) {
    return this.fieldsAdapter.buildFieldsAdapter().getFieldValues(id, request);
  }

  //search fields values
  @Post("/values/search")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({ description: "Fields Values list." })
  @ApiBody({ type: FieldValuesSearchDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async searchFieldValues(
    @Req() request: Request,
    @Body() fieldValuesSearchDto: FieldValuesSearchDto
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .searchFieldValues(request, fieldValuesSearchDto);
  }

  //update
  @Put("/values/:id")
  @ApiBasicAuth("access-token")
  @ApiCreatedResponse({
    description: "Fields Values has been updated successfully.",
  })
  @ApiBody({ type: FieldValuesDto })
  @ApiForbiddenResponse({ description: "Forbidden" })
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    strategy: "excludeAll",
  })
  public async updateFieldValues(
    @Param("id") id: string,
    @Req() request: Request,
    @Body() fieldValuesDto: FieldValuesDto
  ) {
    return this.fieldsAdapter
      .buildFieldsAdapter()
      .updateFieldValues(id, request, fieldValuesDto);
  }
}
