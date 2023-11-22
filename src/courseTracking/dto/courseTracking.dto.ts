// import { Exclude, Expose } from "class-transformer";
// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// export class CourseTrackingDto {
//   @Expose()
//   id: string;

//   @Expose()
//   courseTrackingId: string;

//   @ApiProperty({})
//   @Expose()
//   courseId: string;

//   @ApiProperty({})
//   @Expose()
//   userId: string;

//   @ApiProperty({})
//   @Expose()
//   progressDetail: string;

//   @ApiProperty({})
//   @Expose()
//   contentIds: [];

//   @ApiProperty({})
//   @Expose()
//   startTime: string;

//   @ApiProperty({})
//   @Expose()
//   endTime: string;

//   @ApiProperty({})
//   @Expose()
//   certificate: string;

//   @ApiProperty({})
//   @Expose()
//   status: string;

//   @ApiProperty({})
//   @Expose()
//   source: string;

//   @Expose()
//   date: string;

//   @Expose()
//   createdAt: string;

//   @Expose()
//   updatedAt: string;

//   constructor(obj: any) {
//     Object.assign(this, obj);
//   }
// }


import { Exclude, Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CourseTrackingDto {
  @Expose()
  id: string;

  @Expose()
  courseTrackingId: string;

  @ApiProperty({})
  @Expose()
  courseId: string;

  @ApiProperty({})
  @Expose()
  userId: string;

  @ApiProperty({})
  @Expose()
  progressDetail: string;

  @ApiProperty({})
  @Expose()
  contentIds: [];

  @ApiProperty({})
  @Expose()
  startTime: string;

  @ApiProperty({})
  @Expose()
  endTime: string;

  @ApiProperty({})
  @Expose()
  certificate: string;

  @ApiProperty({})
  @Expose()
  status: string;

  @ApiProperty({})
  @Expose()
  source: string;

  @Expose()
  date: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Total number of Modules completed",
  })
  totalNumberOfModulesCompleted: number;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: Number,
    description: "Total number of Modules",
  })
  totalNumberOfModules: number;

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
