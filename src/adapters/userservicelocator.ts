import { UserCreateDto } from "src/user/dto/user-create.dto";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { UserDto } from "src/user/dto/user.dto";

export interface IServicelocator {
  getUser(
    tenantId: string,
    id: any,
    accessRole: string,
    request: any,
    response: any
  );
  getUserByAuth(tenantId: string, request: any);
  checkAndAddUsers(request: any, userDto: [UserCreateDto]);
  createUser(request: any, userDto: UserCreateDto);
  updateUser(id: string, request: any, userDto: UserCreateDto);
  searchUser(
    tenantId: string,
    request: any,
    response: any,
    userSearchDto: UserSearchDto
  );
  resetUserPassword(request: any, username: string, newPassword: string);
}
