import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";


enum Scope {
  self = 'self',
  student = 'student',
}

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

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: "The scope of the attendance",
    enum: Scope,
    default: Scope.self,
  })
  @IsOptional()
  @IsEnum(Scope, { message: "Please enter valid enum values for scope: [self, student]" })
  scope: string = Scope.student;


  @Expose()
  @IsOptional()
  @IsBoolean({message:"Please enter valid lateMark value as true or false"})
  @ApiPropertyOptional()
  lateMark: boolean = false;

  constructor(obj: any) {
    Object.assign(this, {
      scope: Scope.student, // Ensure default value
      lateMark: false, // Ensure default value
      ...obj, // Override with provided values
    });
  }

}
