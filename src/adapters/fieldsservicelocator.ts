import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";
import { FieldSearchUsingContextDto } from "src/fields/dto/field-seach-using-context";


export interface IServicelocatorfields {
  //fields
  createFields(request: any, fieldsDto: FieldsDto);
  getFields(tenantId, fieldsId, request);
  searchFields(tenantid, request: any, fieldsSearchDto: FieldsSearchDto);
  searchFieldsBasedOnContext(tenantid, request: any, fieldSearchUsingContextDto: FieldSearchUsingContextDto);
  updateFields(fieldsId: string, request: any, fieldsDto: FieldsDto);
  //field values
  createFieldValues(request: any, fieldValuesDto: FieldValuesDto);
  getFieldValues(id, request);
  searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto);
  updateFieldValues(id: string, request: any, fieldValuesDto: FieldValuesDto);
}
