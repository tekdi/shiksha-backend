import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldsDto } from "src/fields/dto/fields.dto";

export interface IServicelocatorfields {
  getFields(fieldsId, request);
  createFields(request: any, fieldsDto: FieldsDto);
  updateFields(fieldsId: string, request: any, fieldsDto: FieldsDto);
  searchFields(request: any, fieldsSearchDto: FieldsSearchDto);
  findMembersOfFields(id, role, request);
  findFieldssByUserId(id, role, request);
  findMembersOfChildFields(fieldsId: string, role: string, request: any);
}
