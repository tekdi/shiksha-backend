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
import { AttendanceDto, BulkAttendanceDTO } from './dto/attendance.dto';
import { AttendanceDateDto } from './dto/attendance-date.dto';
import { Between } from 'typeorm';
import { AttendanceStatsDto } from './dto/attendance-stats.dto';
import { User } from 'src/user/entities/user-entity';



@Injectable()
export class AttendanceService {
    constructor(private configService: ConfigService,
        @InjectRepository(AttendanceEntity)
        private readonly attendanceRepository: Repository<AttendanceEntity>,) { }



    /*
    Method to search attendance for all or for the key value pair provided in filter object 
    @body an object of details consisting of attendance details of user (attendance dto)  
    @return Attendance records from attendance table for provided filters
    */

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

    async attendanceReport(contextId:string) {
        try{
    const query = `
    SELECT 
    u."name",
    COUNT(CASE WHEN aa."attendance" = 'Present' THEN 1 END) * 100.0 / COUNT(aa."attendance") AS attendance_percentage
FROM 
    public."Attendance" AS aa 
INNER JOIN 
    public."Users" AS u ON aa."userId" = u."userId"
WHERE 
    aa."attendance" IN ('Present', 'Absent')
    AND u."role" = 'student'
    AND aa."contextId" = $1  
GROUP BY 
    u."name",
    u."role";
  `;
  
     const result = await this.attendanceRepository.query(query,[contextId]);
          const report= await this.mapResponseforReport(result);

          return new SuccessResponse({
            statusCode: 200,
            message: "Ok.",
            data: report,
        });
        }
        catch(error){

            return new ErrorResponse({
                errorCode: "500",
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

    public async mapResponseforReport(result: any) {
        const attendanceReport = result.map((item: any) => {
            const attendanceReportMapping = {
                name: item?.name ? `${item.name}` : "",
                attendance_percentage: item?.attendance_percentage ? `${item.attendance_percentage}` : "",
            };

            return new AttendanceStatsDto(attendanceReportMapping);
        });

        return attendanceReport;
    }
    /* 
    Method to create,update or add attendance for valid user in attendance table
    @body an object of details consisting of attendance details of user (attendance dto)  
    @return updated details of attendance record 
    */

    public async updateAttendanceRecord(
        request: any,
        attendanceDto: AttendanceDto
    ) {


        try {
                const decoded: any = jwt_decode(request?.headers?.authorization);

                const userId =
                    decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
                const attendanceToSearch = new AttendanceSearchDto({});



                attendanceToSearch.filters = {
                    attendanceDate: attendanceDto.attendanceDate,
                    userId: attendanceDto.userId,
                };


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
        } catch (e) {
            return e;
        }
    }

    /*Method to update attendance for userId 
    @body an object of details consisting of attendance details of user (attendance dto),attendanceId
    @return updated attendance record based on attendanceId
    */
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

    /*method to add attendance of new user in attendance
    @body object containing details related to attendance details (AttendanceDto)
    @return attendance record for newly added user in Attendance table 
    */
    public async createAttendance(request: any, attendanceDto: AttendanceDto) {

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

    /*Method to search attendance fromDate to toDate 
    @body object containing attendance date details for user (AttendanceDateDto)
    @return attendance records from fromDate to toDate     */

    public async attendanceByDate(
        tenantId: string,
        request: any,
        attendanceSearchDto: AttendanceDateDto
    ) {
        try {

            
            let { limit, page } = attendanceSearchDto;
            if (!limit) {
                limit = '0';
            }

            let offset = 0;
            if (page > 1) {
                offset = parseInt(limit) * (page - 1);
            }

            const fromDate = new Date(attendanceSearchDto.fromDate);
            const toDate = new Date(attendanceSearchDto.toDate);

            let whereClause: any = {
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
                take: parseInt(limit),
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
                errorMessage: e,
            });
        }
    }

    /*Method to add multiple attendance records in Attendance table
    @body Array of objects containing attendance details of user (AttendanceDto)
    */

    public async multipleAttendance(
        tenantId: string,
        request: any,
        attendanceData: BulkAttendanceDTO
    ) {
        const responses = [];
        const errors = [];
        try {
            let count = 1;

            for (let attendance of attendanceData.userAttendance) {
                const userAttendance = new AttendanceDto({
                    attendanceDate: attendanceData.attendanceDate,
                    contextId: attendanceData.contextId,
                    attendance: attendance.attendance,
                    userId: attendance.userId
                })
                    const attendanceRes: any = await this.updateAttendanceRecord(
                        request,
                        userAttendance
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
        } catch (e) {
            console.error(e);
            return e;
        }


        return {
            statusCode: 200,
            totalCount: attendanceData.userAttendance.length,
            successCount: responses.length,
            errorCount: errors.length,
            responses,
            errors,
        };
    }

}




