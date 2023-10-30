import { CohortMembersSearchDto } from "src/cohortMembers/dto/cohortMembers-search.dto";
import { CohortMembersDto } from "src/cohortMembers/dto/cohortMembers.dto";

export interface IServicelocatorcohortMembers {
  createCohortMembers(request: any, cohortMembersDto: CohortMembersDto);
  getCohortMembers(tenantId, cohortId, request);
  searchCohortMembers(tenantid, request: any, cohortMembersSearchDto: CohortMembersSearchDto);
  /*updateCohort(cohortId: string, request: any, cohortDto: CohortDto);
  findMembersOfCohort(id, role, request);
  findCohortsByUserId(id, role, request);
  findMembersOfChildCohort(cohortId: string, role: string, request: any);*/
}
