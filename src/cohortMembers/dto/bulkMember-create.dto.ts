import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class BulkCohortMember {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  userId: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  cohortId: string[];
}
