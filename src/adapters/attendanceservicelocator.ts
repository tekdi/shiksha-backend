import { AttendanceDateDto } from "src/attendance/dto/attendance-date.dto";
import { AttendanceSearchDto } from "src/attendance/dto/attendance-search.dto";
import { AttendanceDto } from "src/attendance/dto/attendance.dto";

export interface IServicelocator {
  checkAndAddAttendance(request: Request, attendanceDto: AttendanceDto): unknown;
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
}
