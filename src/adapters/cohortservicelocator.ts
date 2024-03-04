import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
import { CohortDto } from "src/cohort/dto/cohort.dto";

export interface IServicelocatorcohort {
  createCohorts(request: any, cohortDto: [CohortCreateDto]);
  // multipleCohort(tenantid, request: any, cohortDto: [CohortCreateDto])
  getCohort(tenantId, cohortId, request, res);
  searchCohort(tenantid, request: any, cohortSearchDto: CohortSearchDto, res);
  updateCohort(cohortId: string, request: any, cohortDto: CohortCreateDto);
}
