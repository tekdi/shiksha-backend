import { isAfter } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import jwt_decode from "jwt-decode";
import { InjectRepository } from "@nestjs/typeorm";
import { AttendanceEntity } from "./entities/attendance.entity";
import { Repository } from "typeorm";
import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ErrorResponse } from "src/error-response";
import { AttendanceSearchDto } from "./dto/attendance-search.dto";
import { SuccessResponse } from 'src/success-response';
import { AttendanceDto } from './dto/attendance.dto';
import { AttendanceDateDto } from './dto/attendance-date.dto';
import { Between } from 'typeorm';



@Injectable()
export class AttendanceService {
    constructor(private configService: ConfigService,
        @InjectRepository(AttendanceEntity)
        private readonly attendanceRepository: Repository<AttendanceEntity>,) { }

    async searchAttendance(tenantId: string, request: any, attendanceSearchDto: AttendanceSearchDto) {

        try {
            let { limit, page, filters } = attendanceSearchDto;
            if (!limit) {
                limit = '0';
            }

            let offset = 0;
            if (page > 1) {
                offset = parseInt(limit) * (page - 1);
            }
            const whereClause = {};
            if (filters && Object.keys(filters).length > 0) {
                Object.entries(filters).forEach(([key, value]) => {
                    whereClause[key] = value;
                });
            }
            else {
                whereClause['tenantId'] = tenantId;
            }


            const [results, totalCount] = await this.attendanceRepository.findAndCount({
                where: whereClause,
                take: parseInt(limit),
                skip: offset,
            });
            const mappedResponse = await this.mappedResponse(results);

            return new SuccessResponse({
                statusCode: 200,
                message: 'Ok.',
                totalCount,
                data: mappedResponse,
            });
        } catch (error) {
            return new ErrorResponse({
                errorCode: '500',
                errorMessage: error,
            });
        }
    }

    public async mappedResponse(result: any) {
        const attendanceResponse = result.map((item: any) => {
            const attendanceMapping = {
                tenantId: item?.tenantId ? `${item.tenantId}` : "",
                attendanceId: item?.attendanceId ? `${item.attendanceId}` : "",
                userId: item?.userId ? `${item.userId}` : "",
                attendanceDate: item?.attendanceDate ? `${item.attendanceDate}` : "",
                attendance: item?.attendance ? `${item.attendance}` : "",
                remark: item?.remark ? `${item.remark}` : "",
                latitude: item?.latitude ? item.latitude : 0,
                longitude: item?.longitude ? item.longitude : 0,
                image: item?.image ? `${item.image}` : "",
                metaData: item?.metaData ? item.metaData : [],
                syncTime: item?.syncTime ? `${item.syncTime}` : "",
                session: item?.session ? `${item.session}` : "",
                contextId: item?.contextId ? `${item.contextId}` : "",
                contextType: item?.contextType ? `${item.contextType}` : "",
                createdAt: item?.createdAt ? `${item.createdAt}` : "",
                updatedAt: item?.updatedAt ? `${item.updatedAt}` : "",
                createdBy: item?.createdBy ? `${item.createdBy}` : "",
                updatedBy: item?.updatedBy ? `${item.updatedBy}` : "",
            };

            return new AttendanceDto(attendanceMapping);
        });

        return attendanceResponse;
    }

    public async updateAttendanceRecord(
        request: any,
        attendanceDto: AttendanceDto
    ) {

     
        try {
            if( !isAfter(new Date(attendanceDto.attendanceDate), new Date()) && attendanceDto.attendanceDate){
            const decoded: any = jwt_decode(request.headers.authorization);

            const userId =
                decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
            attendanceDto.createdBy = userId;
            attendanceDto.updatedBy = userId;
            const attendanceToSearch = new AttendanceSearchDto({});



            attendanceToSearch.filters = {
                attendanceDate: attendanceDto.attendanceDate,
                userId: attendanceDto.userId,
            };
            console.log("attendanceToSearch.filters",attendanceToSearch.filters)


            const attendanceFound: any = await this.searchAttendance(
                attendanceDto.tenantId,
                request,
                attendanceToSearch
            );


            if (attendanceFound?.errorCode) {
                return new ErrorResponse({
                    errorCode: "500",
                    errorMessage: attendanceFound?.errorMessage,
                });
            }

            if (
                attendanceFound.data.length > 0 &&
                attendanceFound.statusCode === 200
            ) {

                return await this.updateAttendance(
                    attendanceFound.data[0].attendanceId,
                    request,
                    attendanceDto
                );
            } else {

                return await this.createAttendance(request, attendanceDto);
            }
        }
        else{
            return  new ErrorResponse({
                errorCode: '500',
                errorMessage: "Date cannot be from future",
            });
        }
        } catch (e) {
            return e;
        }
    }


    public async updateAttendance(
        attendanceId: string,
        request: any,
        attendanceDto: AttendanceDto
    ) {
        try {
            const attendanceRecord = await this.attendanceRepository.findOne({
                where: { attendanceId },
            });
           
            if (!attendanceRecord) {
                return new ErrorResponse({
                    errorCode: "404",
                    errorMessage: "Attendance record not found",
                });
            }


            this.attendanceRepository.merge(attendanceRecord, attendanceDto);

            // Save the updated attendance record
            const updatedAttendanceRecord = await this.attendanceRepository.save(
                attendanceRecord
            );

            return new SuccessResponse({
                statusCode: 200,
                message: "Attendance record updated successfully",
                data: updatedAttendanceRecord,
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                console.error("Error updating attendance:", error);
                return new ErrorResponse({
                    errorCode: "500",
                    errorMessage: "Internal Server Error",

                });
            }
        }
    }


    public async createAttendance(request: any, attendanceDto: AttendanceDto) {

      console.log("created")
        try {

            const attendance = this.attendanceRepository.create(attendanceDto);
            const result = await this.attendanceRepository.save(attendance);

            return new SuccessResponse({
                statusCode: 200,
                message: "Ok.",
                data: result,
            });
        } catch (error) {
            if (error.code === '23503' && error.constraint === 'Attendance_userId_fkey') {
                // Handle foreign key constraint violation
                return new ErrorResponse({
                    errorCode: "23503",
                    errorMessage: "Please provide valid userID",
                });
            } else {
                console.error('Error creating attendance:', error);
                return new ErrorResponse({
                    errorCode: "500",
                    errorMessage: 'Internal Server Error',
                });
            }
        }
    }

   public async attendanceByDate(
    tenantId: string,
    request: any,
    attendanceSearchDto: AttendanceDateDto
  ) {
    try {
      let offset = 0;
      if (attendanceSearchDto.page > 1) {
          offset = parseInt(attendanceSearchDto.limit) * (attendanceSearchDto.page - 1);
      }

      const fromDate = new Date(attendanceSearchDto.fromDate);
      const toDate = new Date(attendanceSearchDto.toDate);

      const whereClause: any = {
        tenantId: tenantId ? tenantId : '',
        attendanceDate: Between(fromDate, toDate),
      };

      // Add additional filters if present
      if (attendanceSearchDto.filters) {
        Object.keys(attendanceSearchDto.filters).forEach((key) => {
          whereClause[key] = attendanceSearchDto.filters[key];
        });
      }

      const [results, totalCount] = await this.attendanceRepository.findAndCount({
        where: whereClause,
        take: parseInt(attendanceSearchDto.limit),
        skip: offset,
      });

      const mappedResponse = await this.mappedResponse(results);

      return new SuccessResponse({
        statusCode: 200,
        message: "Ok",
        totalCount: totalCount,
        data: mappedResponse,
      });
    } catch (e) {
      console.error(e);
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: "Internal Server Error",
      });
    }
  }

  public async multipleAttendance(
    tenantId: string,
    request: any,
    attendanceData: [AttendanceDto]
  ) {
    const responses = [];
    const errors = [];
    try {
      let count = 1;
      
      for (const attendance of attendanceData) {
        console.log("new Date(attendance.attendanceDate)",attendance.attendanceDate)
        if(attendance.userId && !isAfter(new Date(attendance.attendanceDate), new Date()) && attendance.attendanceDate  && attendance.attendance){
         
        attendance.tenantId = tenantId;
        const attendanceRes: any = await this.updateAttendanceRecord(
          request,
          attendance
        );
        if (attendanceRes?.statusCode === 200) {
          responses.push(attendanceRes.data);
        } else {
          errors.push({
            userId: attendance.userId,
            attendanceRes,
          });
        }
       count++;
        }
        
        else{
          errors.push({
            message:`userId should not be empty null or undefined for record or attendance date should not be of future for ${count} or  attendance should be valid enum value[present,absent,halfday]`
            
          });
          count++;
        }
     
      }
    } catch (e) {
      console.error(e);
      return e;
    }
    
    
    return {
      statusCode: 200,
      totalCount: attendanceData.length,
      successCount: responses.length,
      errorCount:errors.length,
      responses,
      errors,
    };
  }
  
}




