import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import { IServicelocatorfields } from "../fieldsservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
export const HasuraFieldsToken = "HasuraFields";

import { FieldsService } from "./services/fields.service";

@Injectable()
export class HasuraFieldsService implements IServicelocatorfields {
  constructor(
    private httpService: HttpService,
    private fieldsService: FieldsService
  ) {}

  url = `${process.env.BASEAPIURL}`;

  //fields
  public async createFields(request: any, fieldsDto: FieldsDto) {
    const response = await this.fieldsService.createFields(fieldsDto);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      const result = response.data.data.insert_fields_one;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async getFields(tenantId: string, fieldsId: any, request: any) {
    const response = await this.fieldsService.getFields(tenantId, fieldsId);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response?.data?.data?.fields;
      const fieldsResponse = await this.mappedResponse(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: fieldsResponse[0],
      });
    }
  }

  public async searchFields(
    tenantId: string,
    request: any,
    fieldsSearchDto: FieldsSearchDto
  ) {
    const response = await this.fieldsService.searchFields(
      tenantId,
      fieldsSearchDto
    );
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response.data.data.fields;
      const fieldsResponse = await this.mappedResponse(result);
      const count = fieldsResponse.length;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        totalCount: count,
        data: fieldsResponse,
      });
    }
  }

  public async updateFields(
    fieldsId: string,
    request: any,
    fieldsDto: FieldsDto
  ) {
    const response = await this.fieldsService.updateFields(fieldsId, fieldsDto);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      const result = response.data.data;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  //field values
  public async createFieldValues(request: any, fieldValuesDto: FieldValuesDto) {
    const response = await this.fieldsService.createFieldValues(fieldValuesDto);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      const result = response.data.data.insert_field_values_one;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async getFieldValues(id: any, request: any) {
    const response = await this.fieldsService.getFieldValues(id);
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response?.data?.data?.field_values;
      const fieldsResponse = await this.mappedResponseValues(result);
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: fieldsResponse[0],
      });
    }
  }

  public async searchFieldValues(
    request: any,
    fieldValuesSearchDto: FieldValuesSearchDto
  ) {
    const response = await this.fieldsService.searchFieldValues(
      fieldValuesSearchDto
    );
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      let result = response.data.data.field_values;
      const fieldValuesResponse = await this.mappedResponseValues(result);
      const count = fieldValuesResponse.length;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        totalCount: count,
        data: fieldValuesResponse,
      });
    }
  }

  public async updateFieldValues(
    id: string,
    request: any,
    fieldValuesDto: FieldValuesDto
  ) {
    const response = await this.fieldsService.updateFieldValues(
      id,
      fieldValuesDto
    );
    if (response?.data?.errors) {
      return new ErrorResponse({
        errorCode: response?.data?.errors[0]?.extensions?.code,
        errorMessage: response?.data?.errors[0]?.message,
      });
    } else {
      const result = response.data.data;
      return new SuccessResponse({
        statusCode: 200,
        message: "Ok.",
        data: result,
      });
    }
  }

  public async mappedResponse(result: any) {
    const fieldsResponse = result.map((item: any) => {
      const fieldsMapping = {
        TenantId: item?.TenantId ? `${item.TenantId}` : "",
        field_id: item?.field_id ? `${item.field_id}` : "",
        asset_id: item?.asset_id ? `${item.asset_id}` : "",
        context: item?.context ? `${item.context}` : "",
        context_id: item?.context_id ? `${item.context_id}` : "",
        group_id: item?.group_id ? `${item.group_id}` : "",
        name: item?.name ? `${item.name}` : "",
        label: item?.label ? `${item.label}` : "",
        default_value: item?.default_value ? `${item.default_value}` : "",
        type: item?.type ? `${item.type}` : "",
        note: item?.note ? `${item.note}` : "",
        description: item?.description ? `${item.description}` : "",
        state: item?.state ? `${item.state}` : "",
        required: item?.required ? `${item.required}` : "",
        ordering: item?.ordering ? `${item.ordering}` : "",
        metadata: item?.metadata ? `${item.metadata}` : "",
        access: item?.access ? `${item.access}` : "",
        only_use_in_subform: item?.only_use_in_subform
          ? `${item.only_use_in_subform}`
          : "",
      };
      return new FieldsDto(fieldsMapping);
    });

    return fieldsResponse;
  }
  public async mappedResponseValues(result: any) {
    const fieldValuesResponse = result.map((item: any) => {
      const fieldValuesMapping = {
        field_id: item?.field_id ? `${item.field_id}` : "",
        value: item?.value ? `${item.value}` : "",
        item_id: item?.item_id ? `${item.item_id}` : "",
        id: item?.id ? `${item.id}` : "",
      };
      return new FieldValuesDto(fieldValuesMapping);
    });

    return fieldValuesResponse;
  }
}
