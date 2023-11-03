import { Exclude, Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CohortMembersDto {
  //generated fields
  @Expose()
  tenantId: string;
  @Expose()
  cohortMembershipId: string;
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;

  //cohortId
  @ApiProperty({
    type: String,
    description: "The cohortId of the cohort members",
    default: "",
  })
  @Expose()
  cohortId: string;

  //userId
  @ApiProperty({
    type: String,
    description: "The userId of the cohort members",
    default: "",
  })
  @Expose()
  userId: string;

  //role
  @ApiProperty({
    type: String,
    description: "The role of the cohort members",
    default: "",
  })
  @Expose()
  role: string;

  //createdBy
  @ApiProperty({
    type: String,
    description: "The createdBy of the cohort members",
    default: "",
  })
  @Expose()
  createdBy: string;

  //updatedBy
  @ApiProperty({
    type: String,
    description: "The updatedBy of the cohort members",
    default: "",
  })
  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
