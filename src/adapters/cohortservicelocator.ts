import { CohortSearchFieldsDto } from "src/cohort/dto/cohort-search-fields.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { CohortDto } from "src/cohort/dto/cohort.dto";

export interface IServicelocatorcohort {
  createCohort(request: any, cohortDto: CohortDto);
  getCohort(tenantId, cohortId, request, res);
  searchCohort(tenantid, request: any, cohortSearchDto: CohortSearchDto, res);
  searchCohortFieldValues(tenantid, request: any, cohortSearchFieldsDto: CohortSearchFieldsDto, res);
  updateCohort(cohortId: string, request: any, cohortDto: CohortDto);
}
