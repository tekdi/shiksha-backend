import { ManyToOne, JoinColumn } from 'typeorm';
import { IsDate, IsDateString, IsDefined, IsEnum, IsUUID, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Exclude, Expose, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { User } from 'src/user/entities/user-entity';
import { format, isAfter, isBefore, isValid } from 'date-fns'; // Import isAfter function from date-fns
import { HttpException, HttpStatus } from '@nestjs/common';

//for student valid enum are[present,absent]
//for teacher valid enum are[present,on-leave,half-day]
enum Attendance{
  present="present",
  absent="absent",
  onLeave="on-leave",
  halfDay="half-day"
}

@ValidatorConstraint({ name: 'isNotAfterToday', async: false })
export class IsNotAfterToday implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    return isBefore(date, new Date());
  }

  defaultMessage(args: ValidationArguments) {
    return 'Attendance date must not be after today';
  }
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
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  @Expose()
  userId: string;

  @ManyToOne(() => User, {nullable:true})
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    type: String,
    description: "The date of the attendance in format yyyy-mm-dd",
    default: new Date()
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  @Validate(IsNotAfterToday, {
    message: 'Attendance date must not be after today',
  })  
  @Expose()
  attendanceDate: Date;

  @ApiProperty({
    type: String,
    description: "The attendance of the attendance",
    default: "",
  })
  @Expose()
  @IsNotEmpty()
  @IsEnum(Attendance,{message:"Please enter valid enum values for attendance [present, absent,on-leave, half-day]"})
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
  latitude: number;

  @ApiProperty({
    type: String,
    description: "The longitude of the attendance",
    default: 0,
  })
  @Expose()
  @ApiPropertyOptional()
  longitude: number;

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


export class UserAttendanceDTO {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(Attendance,{message:"Please enter valid enum values for attendance [present, absent,on-leave, half-day]"})
  @IsNotEmpty()
   // Assuming these are the possible values for attendance
  attendance: string;
}

export class BulkAttendanceDTO {
  @ApiProperty({
    type: String,
    description: "The date of the attendance in format yyyy-mm-dd",
    default: new Date()
  })
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please provide a valid date in the format yyyy-mm-dd' })
  @Validate(IsNotAfterToday, {
    message: 'Attendance date must not be after today',
  })  
  @Expose()
  attendanceDate: Date;

  @IsUUID()
    @Expose()
    @IsNotEmpty()

  contextId: string;

 // Adjust the max size according to your requirements
  userAttendance: UserAttendanceDTO[];

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
