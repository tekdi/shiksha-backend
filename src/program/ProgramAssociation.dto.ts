import { Exclude, Expose } from "class-transformer";
import { IsUUID, IsString, IsNotEmpty, IsDate } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProgramAssociationDto {
  @Expose()
  @IsUUID()
  progAssocNo: number; // AUTO GENERATED

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Board",
  })
  board: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Medium",
  })
  medium: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Grade",
  })
  grade: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    description: "Name of the Subject",
  })
  subject: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: Object,
    description: "Rules of respctive courses",
  })
  rules: object;

 

  @Expose()
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: "Associated Program Id",
  })
  programId: string;

 

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
