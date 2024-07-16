import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import { Response } from "express";
import { FieldsUpdateDto } from "src/fields/dto/fields-update.dto";
export interface IServicelocatorfields {
  //fields
  createFields(request: any, fieldsDto: FieldsDto, response: Response);
  //Update
  updateFields(fieldId: any, request: any, fieldsUpdateDto: FieldsUpdateDto, response: Response);
  // getFields(tenantId, fieldsId, request);
  searchFields(tenantid, request: any, fieldsSearchDto: FieldsSearchDto, response: Response);
  // updateFields(fieldsId: string, request: any, fieldsDto: FieldsDto);
  //field values
  createFieldValues(request: any, fieldValuesDto: FieldValuesDto, response: Response);
  // getFieldValues(id, request);
  searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto, response: Response);
  updateFieldValues(id: string, request: any, fieldValuesDto: FieldValuesDto);
  getFieldOptions(request: any, fieldName: string, controllingfieldfk: string, context: string, contextType: string, response: Response);
  getFormCustomField(requiredData ,response);

}
