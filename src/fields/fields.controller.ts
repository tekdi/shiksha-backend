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
  UseGuards,
} from "@nestjs/common";
import { FieldsSearchDto } from "./dto/fields-search.dto";
import { Request } from "@nestjs/common";
import { FieldsDto } from "./dto/fields.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";

import { FieldsAdapter } from "./fieldsadapter";
import { FieldValuesDto } from "./dto/field-values.dto";
import { FieldValuesSearchDto } from "./dto/field-values-search.dto";
import { FieldsService } from "./fields.service";
import { JwtAuthGuard } from "src/common/guards/keycloak.guard";


@ApiTags("Fields")
@Controller("fields")
@UseGuards(JwtAuthGuard)
export class FieldsController {
  constructor(private fieldsAdapter: FieldsAdapter,
    private readonly fieldsService: FieldsService
  ) { }

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

    return this.fieldsService.createFields(request, fieldsDto);

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
    return this.fieldsService.searchFields(tenantid, request, fieldsSearchDto);
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
    return this.fieldsService.createFieldValues(request, fieldValuesDto);
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
    return this.fieldsService.searchFieldValues(request, fieldValuesSearchDto);
  }

  

}
