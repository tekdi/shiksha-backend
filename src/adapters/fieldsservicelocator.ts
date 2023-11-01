import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldsDto } from "src/fields/dto/fields.dto";

export interface IServicelocatorfields {
  createFields(request: any, fieldsDto: FieldsDto);
  getFields(tenantId, fieldsId, request);
  searchFields(tenantid, request: any, fieldsSearchDto: FieldsSearchDto);
  /*updateFields(fieldsId: string, request: any, fieldsDto: FieldsDto);
  findMembersOfFields(id, role, request);
  findFieldssByUserId(id, role, request);
  findMembersOfChildFields(fieldsId: string, role: string, request: any);*/
}
