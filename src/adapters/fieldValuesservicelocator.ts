import { FieldValuesSearchDto } from "src/fieldValues/dto/fieldValues-search.dto";
import { FieldValuesDto } from "src/fieldValues/dto/fieldValues.dto";

export interface IServicelocatorfieldValues {
  getFieldValues(fieldValuesId, request);
  createFieldValues(request: any, fieldValuesDto: FieldValuesDto);
  updateFieldValues(fieldValuesId: string, request: any, fieldValuesDto: FieldValuesDto);
  searchFieldValues(request: any, fieldValuesSearchDto: FieldValuesSearchDto);
  findMembersOfFieldValues(id, role, request);
  findFieldValuessByUserId(id, role, request);
  findMembersOfChildFieldValues(fieldValuesId: string, role: string, request: any);
}
