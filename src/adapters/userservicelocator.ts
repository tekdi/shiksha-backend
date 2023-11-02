import { UserSearchDto } from "src/user/dto/user-search.dto";
import { UserDto } from "src/user/dto/user.dto";

export interface IServicelocator {
  getUser(tenantId: string, id: any, request: any);
  getUserByAuth(tenantId: string, request: any);
  createUser(request: any, teacherDto: UserDto);
  updateUser(id: string, request: any, userDto: UserDto);
  searchUser(tenantId: string, request: any, userSearchDto: UserSearchDto);
  resetUserPassword(request: any, username: string, newPassword: string);
}
