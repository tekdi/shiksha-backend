import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { CohortDto } from "src/cohort/dto/cohort.dto";

export interface IServicelocatorcohort {
  getCohort(cohortId, request);
  createCohort(request: any, cohortDto: CohortDto);
  updateCohort(cohortId: string, request: any, cohortDto: CohortDto);
  searchCohort(request: any, cohortSearchDto: CohortSearchDto);
  findMembersOfCohort(id, role, request);
  findCohortsByUserId(id, role, request);
  findMembersOfChildCohort(cohortId: string, role: string, request: any);
}
