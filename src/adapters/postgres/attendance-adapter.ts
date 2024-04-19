import { User } from '../../user/entities/user-entity';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from "@nestjs/typeorm";
import { AttendanceEntity } from "../../attendance/entities/attendance.entity";
import {  Repository,Between } from "typeorm";
import {  HttpStatus, Injectable } from "@nestjs/common";
import { AttendanceSearchDto } from "../../attendance/dto/attendance-search.dto";
import { SuccessResponse } from 'src/success-response';
import { AttendanceDto, BulkAttendanceDTO } from '../../attendance/dto/attendance.dto';
import { AttendanceDateDto } from '../../attendance/dto/attendance-date.dto';
import { AttendanceStatsDto } from '../../attendance/dto/attendance-stats.dto';
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { CohortMembers } from 'src/cohortMembers/entities/cohort-member.entity';
const moment = require('moment');

@Injectable()
export class PostgresAttendanceService {
    constructor(private configService: ConfigService,
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(CohortMembers)
        private cohortMembersRepository: Repository<CohortMembers>
    ) { }



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
    
            const UserKeys = this.userRepository.metadata.columns.map((column) => column.propertyName);
            const AttendaceKeys = this.attendanceRepository.metadata.columns.map((column) => column.propertyName);
            const CohortMembersKeys = this.cohortMembersRepository.metadata.columns.map((column) => column.propertyName);
    
            let whereClause = `u."tenantId" = $1`; // Default WHERE clause for filtering by tenantId
            let queryParams = [tenantId]; // Parameters for the query
            let attendanceList = '';
            if (filters && Object.keys(filters).length > 0) {
                let index = 2; // Starting index for additional parameters
                for (const [key, value] of Object.entries(filters)) {
                    if (UserKeys.includes(key)) {
                        whereClause += ` AND u."${key}" = $${index}`;
                        queryParams.push(value);
                    } else if (AttendaceKeys.includes(key)) {
                        if (key === "attendanceDate") {
                            attendanceList = ` AND (a."attendanceDate" = $${index} OR a."attendanceDate" IS NULL)`;
                        }
                        whereClause += ` AND a."${key}" = $${index}`;
                        queryParams.push(value);
                    } else if (CohortMembersKeys.includes(key)) {
                        whereClause += ` AND cm."${key}" = $${index}`;
                        queryParams.push(value);
                    } else if (filters.fromDate && filters.toDate) {
                        whereClause += ` AND a."attendanceDate" BETWEEN $${index} AND $${index + 1}`;
                        queryParams.push(filters.fromDate);
                        queryParams.push(filters.toDate);
                        index += 1; // Increment index for toDate parameter
                    } else {
                        return new ErrorResponseTypeOrm({
                            statusCode: HttpStatus.BAD_REQUEST,
                            errorMessage: `${key} Invalid key`,
                        });
                    }
                    index += 1; // Increment index for next parameter
                }
            }
    
            const query = `
                SELECT u.*, cm.*, a.*     
                FROM "Users" u
                INNER JOIN "CohortMembers" cm ON cm."userId" = u."userId" 
                LEFT JOIN "Attendance" a ON a."userId" = cm."userId" ${attendanceList} 
                WHERE ${whereClause};
            `;
            const results = await this.attendanceRepository.query(query, queryParams);
            const mappedResponse = await this.mappedResponse(results);
    
            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: 'Ok.',
                data: mappedResponse,
            });
        } catch (error) {
            if (error.code=== "22P02"){
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: `Invalid value Entered For ${error.routine}`,
                })
            }
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });
        }
    }

    async attendanceReport(attendanceStatsDto: AttendanceStatsDto) {
        let { contextId, attendanceDate, report, limit, offset, filters } = attendanceStatsDto       
        try {
            if (report === true) {
                let nameFilter = '';
                let userFilter = '';

            if (filters && filters.search) {
                nameFilter = `AND u."name" ILIKE '%${filters.search.trim()}%'`;
            }
            if (filters && filters.userId) {
                userFilter = ` AND u."userId"='${filters.userId.trim()}'`;
            }

                let query = `
                SELECT u."userId",u."name",
                CASE 
                WHEN COUNT(*) = 0 THEN NULL
                ELSE ROUND(COUNT(CASE WHEN aa."attendance" = 'present' THEN 1 END) * 100.0 / COUNT(*),0)
                END AS attendance_percentage
                FROM public."CohortMembers" AS cm 
                INNER JOIN public."Users" AS u ON cm."userId" = u."userId"
                LEFT JOIN public."Attendance" AS aa ON cm."userId" = aa."userId"
                WHERE cm."cohortId" = $1 AND cm."role" = 'student'
                ${userFilter}
                ${nameFilter}
                GROUP BY u."userId"
                 `;

                if (filters) {
                    if (filters.nameOrder && filters.nameOrder==="asc" || filters.nameOrder==="desc") {
                        query += ` ORDER BY "name" ${filters.nameOrder}`
                        
                    }
                    else if (filters.percentageOrder && filters.percentageOrder==="asc" || filters.percentageOrder==="desc") {
                        query += ` ORDER BY attendance_percentage ${filters.percentageOrder}`
                    }

                }
                query += `
                LIMIT $2
                OFFSET $3`
                const result = await this.attendanceRepository.query(query, [contextId, limit, offset]);

                if((!filters) || (!filters?.userId))
                { 
                  // We dont need average for single user
                let countquery = `SELECT ROUND(AVG(attendance_percentage)) AS average_attendance_percentage
                FROM (
                    SELECT u."userId", u."name",
                        CASE 
                            WHEN COUNT(*) = 0 THEN NULL
                            ELSE ROUND(COUNT(CASE WHEN aa."attendance" = 'present' THEN 1 END) * 100.0 / COUNT(*))
                        END AS attendance_percentage
                    FROM public."CohortMembers" AS cm 
                    INNER JOIN public."Users" AS u ON cm."userId" = u."userId"
                    LEFT JOIN public."Attendance" AS aa ON cm."userId" = aa."userId"
                    WHERE cm."cohortId" = $1 AND cm."role" = 'student'
                    ${userFilter}
                    GROUP BY u."userId"
                ) AS subquery;
                `

              const average=await this.attendanceRepository.query(countquery,[contextId]) 
               const report = await this.mapResponseforReport(result);
                const response = {
                    report,
                    average:average[0]
                }
                return new SuccessResponse({
                    statusCode: HttpStatus.OK,
                    message: "Ok.",
                    data: response,
                    
                });
            }
            else
            {
               const response = await this.mapResponseforReport(result);
                return new SuccessResponse({
                    statusCode: HttpStatus.OK,
                    message: "Ok.",
                    data: response,
                    
                });
            }


            }
            else if (report === false) {
                if (attendanceDate) {
                    const query = `
                SELECT *
                FROM public."Users" AS u
                INNER JOIN public."CohortMembers" AS cm ON cm."userId" = u."userId" AND cm."role"='student'
                LEFT JOIN public."Attendance" AS aa ON aa."userId" = cm."userId" AND (aa."attendanceDate" =$1 OR aa."attendanceDate" IS NULL)
                where cm."cohortId" = $2
                LIMIT $3
                OFFSET $4
                `;



                    const result = await this.attendanceRepository.query(query, [attendanceDate, contextId, limit, offset]);
                    const report = await this.mapAttendanceRecord(result);
                   
                    


                    return new SuccessResponse({
                        statusCode: 200,
                        message: "Ok.",
                        data: report
                    });
                }

                else {

                    return new ErrorResponseTypeOrm({
                        statusCode: HttpStatus.BAD_REQUEST,
                        errorMessage: "Please provide valid attendance date",
                    });

                }
            }
        }
        catch (error) {

            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: error,
            });


        }
    }

    public async mappedResponse(result: any) {
        const attendanceResponse = result.map((item: any) => {

            const dateObject = new Date(item.attendanceDate);
            const formattedDate = moment(dateObject).format('YYYY-MM-DD');            const attendanceMapping = {
                tenantId: item?.tenantId ? `${item.tenantId}` : "",
                attendanceId: item?.attendanceId ? `${item.attendanceId}` : "",
                userId: item?.userId ? `${item.userId}` : "",
                attendanceDate: item.attendanceDate ? formattedDate : null,
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
                username:item?.username ? `${item.username}` : "",
                role:item?.role ? `${item.role}` : "",

            };


            return new AttendanceDto(attendanceMapping);
        });

        return attendanceResponse;
    }

    public async mapResponseforReport(result: any) {
        const attendanceReport = result.map((item: any) => {
            const attendanceReportMapping = {
                name: item?.name ? `${item.name}` : "",
                userId: item?.userId ? `${item.userId}` : "",
                attendance_percentage: item?.attendance_percentage ? `${item.attendance_percentage}` : "",
            };
                
            return new AttendanceStatsDto(attendanceReportMapping);
        });

        return attendanceReport;
    }

    public async mapAttendanceRecord(result: any) {
        const attendanceRecords = result.map((item: any) => {
            const dateObject = new Date(item.attendanceDate);
            const formattedDate = moment(dateObject).format('YYYY-MM-DD');

            let attendance = {
                name: item?.name ? `${item.name}` : "",
                userId: item?.userId ? `${item.userId}` : "",
                attendance: item?.attendance ? `${item.attendance}` : "",
                attendanceDate: item.attendanceDate ? formattedDate : null

            };
            return new AttendanceStatsDto(attendance);
        });

        return attendanceRecords;
    }
    /* 
    Method to create,update or add attendance for valid user in attendance table
    @body an object of details consisting of attendance details of user (attendance dto)  
    @return updated details of attendance record 
    */

    public async updateAttendanceRecord(
        loginUserId,
        attendanceDto: AttendanceDto
    ) {


        try {

            const Isvalid = await this.validateUserForCohort(attendanceDto.userId,attendanceDto.contextId)

            if(!Isvalid){

                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Invalid combination of contextId and userId",
                }); 

            }

            const attendanceToSearch = new AttendanceSearchDto({});

            attendanceToSearch.filters = {
                attendanceDate: attendanceDto.attendanceDate,
                userId: attendanceDto.userId,
            };


            const attendanceFound: any = await this.searchAttendance(
                attendanceDto.tenantId,
                loginUserId,
                attendanceToSearch
            );


            if (attendanceFound instanceof ErrorResponseTypeOrm) {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    errorMessage: attendanceFound?.errorMessage,
                });
            }

            if (
                attendanceFound.data.length > 0 && attendanceFound.data[0].attendanceId != "" &&
                attendanceFound.statusCode === 200 && attendanceFound instanceof SuccessResponse
            ) {
                attendanceDto.updatedBy = loginUserId
              return   await this.updateAttendance(
                    attendanceFound.data[0].attendanceId,
                    loginUserId,
                    attendanceDto
                );
            } else {
                attendanceDto.createdBy = loginUserId;
                attendanceDto.updatedBy = loginUserId;
                return await this.createAttendance(loginUserId, attendanceDto);
            }
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
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
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Attendance record not found",
                });
            }


            this.attendanceRepository.merge(attendanceRecord, attendanceDto);

            // Save the updated attendance record
            const updatedAttendanceRecord = await this.attendanceRepository.save(
                attendanceRecord
            );

            return new SuccessResponse({
                statusCode: HttpStatus.OK,
                message: "Attendance record updated successfully",
                data: updatedAttendanceRecord,
            });
        } catch (error) {

            if (error.code == '23503') {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Please provide valid contextId",
                });
            }
            else{          
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    errorMessage: error,

                })
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
                statusCode: HttpStatus.CREATED,
                message: "Attendance created successfully.",
                data: result,
            });
        } catch (error) {

            if (error.code == '23503') {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorMessage: "Please enter valid UserId and contextId",
                });
            } else {
                return new ErrorResponseTypeOrm({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    errorMessage: error,
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
                statusCode: HttpStatus.OK,
                message: "Ok",
                totalCount: totalCount,
                data: mappedResponse,
            });
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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
                    userId: attendance.userId,
                    tenantId:tenantId
                })
                const attendanceRes: any = await this.updateAttendanceRecord(
                    request,
                    userAttendance
                );

                if (attendanceRes?.statusCode === 200||attendanceRes?.statusCode === 201) {
                    responses.push(attendanceRes.data);
                }
                 else {
                    errors.push({
                        userId: attendance.userId,
                        attendanceRes,
                    });
                }
                count++;
            
           
            }
        } catch (e) {
            return new ErrorResponseTypeOrm({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                errorMessage: e,
            });
        }


        return {
            statusCode: HttpStatus.OK,
            totalCount: attendanceData.userAttendance.length,
            successCount: responses.length,
            errorCount: errors.length,
            responses,
            errors,
        };
    }



    public async validateUserForCohort(userId,cohortId)
        {
            const attendanceRecord = await this.cohortMembersRepository.findOne({
                where: { userId, cohortId } // Include cohortId in the where clause
            });
            if(attendanceRecord){
                return true
            }else{
                return false
            }
            
        }

}




