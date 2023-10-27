import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { CohortDto } from "src/cohort/dto/cohort.dto";

export interface IServicelocatorcohort {
  createCohort(request: any, cohortDto: CohortDto);
  getCohort(tenantId, cohortId, request);
  searchCohort(tenantid, request: any, cohortSearchDto: CohortSearchDto);
  /*updateCohort(cohortId: string, request: any, cohortDto: CohortDto);
  findMembersOfCohort(id, role, request);
  findCohortsByUserId(id, role, request);
  findMembersOfChildCohort(cohortId: string, role: string, request: any);*/
}
