import { Exclude, Expose } from "class-transformer";
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImportCsvDto {
  @Expose()
  tenantId: string;

  @ApiProperty({
    type: String,
    description: "put that table name",
  })
  @Expose()
  context: string;

  // @ApiProperty({
  //   type: "string",
  //   format: "binary",
  //   description: "The image of person",
  //   default: "NA",
  // })
  // @Expose()
  // file: string;


  constructor(partial: Partial<ImportCsvDto>) {
    Object.assign(this, partial);
  }
}
