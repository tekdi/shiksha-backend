import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AttendanceDto {
  @Expose()
  attendanceId: string;

  @Expose()
  tenantId: string;

  @ApiProperty({
    type: String,
    description: "The userid of the attendance",
    default: "",
  })
  @Expose()
  userId: string;

  @ApiProperty({
    type: String,
    description: "The date of the attendance in format yyyy-mm-dd",
    default: new Date(),
  })
  @Expose()
  attendanceDate: string;

  @ApiProperty({
    type: String,
    description: "The attendance of the attendance",
    default: "",
  })
  @Expose()
  attendance: string;

  @ApiProperty({
    type: String,
    description: "The remark of the attendance",
    default: "",
  })
  @Expose()
  @ApiPropertyOptional()
  remark: string;

  @ApiProperty({
    type: String,
    description: "The latitude of the attendance",
    default: 0,
  })
  @Expose()
  @ApiPropertyOptional()
  latitude: Number;

  @ApiProperty({
    type: String,
    description: "The longitude of the attendance",
    default: 0,
  })
  @Expose()
  @ApiPropertyOptional()
  longitude: Number;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "The image of person",
    default: "NA",
  })
  @Expose()
  @ApiPropertyOptional()
  image: string;

  @ApiPropertyOptional()
  @Expose()
  metaData: string;

  @ApiPropertyOptional()
  @Expose()
  syncTime: string;

  @ApiPropertyOptional()
  @Expose()
  session: string;

  @ApiPropertyOptional({
    type: String,
    description: "The contextType of the attendance",
    default: "",
  })
  @Expose()
  contextType: string;

  @ApiPropertyOptional({
    type: String,
    description: "The contextId of the attendance",
    default: "",
  })
  @Expose()
  contextId: string;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
