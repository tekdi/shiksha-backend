import { AttendanceDateDto } from "src/attendance/dto/attendance-date.dto";
import { AttendanceSearchDto } from "src/attendance/dto/attendance-search.dto";
import { AttendanceDto } from "src/attendance/dto/attendance.dto";

export interface IServicelocator {
  getAttendance(tenantId: string, attendanceId: string, request: any);
  updateAttendance(
    attendanceId: string,
    request: any,
    attendanceDto: AttendanceDto
  );
  createAttendance(request: any, attendanceDto: AttendanceDto);
  multipleAttendance(
    tenantId: string,
    request: any,
    attendanceData: [AttendanceDto]
  );
  searchAttendance(
    tenantId: string,
    request: any,
    attendanceSearchDto: AttendanceSearchDto
  );
  attendanceByDate(
    tenantId: string,
    request: any,
    attendanceSearchDto: AttendanceDateDto
  );
  studentAttendanceByGroup(date: string, groupId: string, request: any);
  studentAttendanceByUserId(date: string, userId: string, request: any);
}
