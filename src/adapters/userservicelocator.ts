import { UserCreateDto } from "src/user/dto/user-create.dto";
import { UserSearchDto } from "src/user/dto/user-search.dto";
import { UserDto } from "src/user/dto/user.dto";

export interface IServicelocator {
  // getUser(
  //   userId?:Record<string, string>,
  //   response?: any,
  //   tenantId?: string,
  //   id?: any,
  //   accessRole?: string,
  //   request?: any,
  // );
  getUsersDetailsById(userData: Record<string, string>, response:any);
  getUsersDetailsByCohortId(userData: Record<string, string>, response:any);
  updateUser(userDto?: any,response?: any);
  createUser(request: any, userDto: UserCreateDto);
  findUserDetails(userID:any,username:String)
  searchUser(
    tenantId: string,
    request: any,
    response: any,
    userSearchDto: UserSearchDto
  );
  resetUserPassword(request: any, username: string, newPassword: string);
  deleteUserById(userId);

}
