import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";

export interface IServicelocatorfields {
  //fields
  createFields(request: any, fieldsDto: FieldsDto);
  // getFields(tenantId, fieldsId, request);
  searchFields(tenantid, request: any, fieldsSearchDto: FieldsSearchDto);
  // updateFields(fieldsId: string, request: any, fieldsDto: FieldsDto);
  //field values
  createFieldValues(request: any, fieldValuesDto: FieldValuesDto,response);
  // getFieldValues(id, request);
  searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto);
  updateFieldValues(id: string, request: any, fieldValuesDto: FieldValuesDto);
}
