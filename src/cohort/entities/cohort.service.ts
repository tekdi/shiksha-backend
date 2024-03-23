import { Injectable } from "@nestjs/common";
import { CohortInterface } from "../../cohort/interfaces/cohort.interface";
import { HttpService } from "@nestjs/axios";
import { SuccessResponse } from "src/success-response";
import { ErrorResponse } from "src/error-response";
const resolvePath = require("object-resolve-path");
import jwt_decode from "jwt-decode";
import { CohortDto } from "src/cohort/dto/cohort.dto";
import { CohortSearchDto } from "src/cohort/dto/cohort-search.dto";
// import { IServicelocatorcohort } from "../cohortservicelocator";
import { UserDto } from "src/user/dto/user.dto";
import { StudentDto } from "src/student/dto/student.dto";
// import { FieldsService } from "./services/fields.service";
import { CohortCreateDto } from "src/cohort/dto/cohort-create.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { IsNull, Not, Repository, getConnection, getRepository } from "typeorm";
import { Cohort } from "src/cohort/entities/cohort.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class CohortService {
  private cohort: CohortInterface;

  constructor(
    @InjectRepository(Cohort)
    private cohortRepository: Repository<Cohort>
  ) {}

  public async getCohort(
    tenantId: string,
    cohortId: string,
    request: any,
    res: any
  ) {
    try {
      console.log("Tenant id", tenantId);
      console.log("cohortId", cohortId);
      const cohort = await this.cohortRepository.findOne({
        where: { tenantId: tenantId, cohortId: cohortId },
      });
      if (!cohort) {
        console.log("if ! cohort");

        return res.status(404).send({
          statusCode: 404,
          message: "Cohort not found.",
        });
      }
      console.log("cohort", cohort);
      return res.status(200).send({
        statusCode: 200,
        message: "Ok.",
        data: cohort,
      });
    } catch (error) {
      console.log("heyyy");
      console.error("Error fetching cohort:", error);
      return res.status(500).send({
        statusCode: 500,
        message: "Internal server error.",
      });
    }
  }
}
