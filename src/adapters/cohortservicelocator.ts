import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { CohortUpdateDto } from "src/cohort/dto/cohort-update.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { CohortDto } from "src/cohort/dto/cohort.dto";

export interface IServicelocatorcohort {
  getCohortsDetails(cohortId: string);
  createCohort(request: any, cohortDto: CohortCreateDto);
  searchCohort(tenantid, request: any, cohortSearchDto: CohortSearchDto);
  updateCohort(cohortId: string, request: any, cohortUpdateDto: CohortUpdateDto);
  updateCohortStatus(cohortId: string, request: any);
}
