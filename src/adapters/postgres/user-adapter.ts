import { ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user-entity'
import { FieldValues } from '../../user/entities/field-value-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from '../../user/dto/user-create.dto';
import jwt_decode from "jwt-decode";
import {
  getKeycloakAdminToken,
  createUserInKeyCloak,
  checkIfUsernameExistsInKeycloak,
} from "../../common/utils/keycloak.adapter.util"
import { ErrorResponse } from 'src/error-response';
import { SuccessResponse } from 'src/success-response';
import { Field } from '../../user/entities/field-entity';
import APIResponse from '../../utils/response';
import { CohortMembers } from 'src/cohortMembers/entities/cohort-member.entity';
import axios, { AxiosInstance, AxiosRequestConfig } from "axios"
import { ErrorResponseTypeOrm } from 'src/error-response-typeorm';
import { isUUID } from 'class-validator';
import { UserSearchDto } from 'src/user/dto/user-search.dto';


@Injectable()
export class PostgresUserService {
  axios = require("axios");
  constructor(
    // private axiosInstance: AxiosInstance,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FieldValues)
    private fieldsValueRepository: Repository<FieldValues>,
    @InjectRepository(Field)
    private fieldsRepository: Repository<Field>,
    @InjectRepository(CohortMembers)
    private cohortMemberRepository: Repository<CohortMembers>
  ) { }
  async  searchUser(tenantId: string,
    request: any,
    response: any,
    userSearchDto: UserSearchDto){
    try {
      let findData = await this.findAllUserDetails(userSearchDto);
      if(!findData){
      return new SuccessResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No Data Found For User',});
      }
      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Ok.',
        data: findData,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async findAllUserDetails(userSearchDto){
    let { limit, page, filters } = userSearchDto;

    let offset = 0;
    if (page > 1) {
      offset = parseInt(limit) * (page - 1);
    }

    if (limit.trim() === '') {
      limit = '0';
    }

    const whereClause = {};
    if (filters && Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        whereClause[key] = value;
      });
    }
    const results = await this.usersRepository.find({
      where: whereClause,
      skip: offset,
      take: parseInt(limit),
    });
    return results;
  }

  async getUsersDetailsById(userData: Record<string, string>, response: any) {
    try {
      if (!isUUID(userData.userId)) {
        return new SuccessResponse({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Please Enter Valid User ID',
        });
      }
      const result = {
        userData: {
        }
      };
      let customFieldsArray = [];

      const [filledValues, userDetails] = await Promise.all([
        this.findFilledValues(userData.userId),
        this.findUserDetails(userData.userId)
      ]);
      if(!userDetails){
        return new SuccessResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User Not Found',
        });
      }
      if(!userData.fieldValue){
        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: 'Ok.',
          data: userDetails,
        });
      }
      const customFields = await this.findCustomFields(userData, userDetails.role)

      result.userData = userDetails;
      const filledValuesMap = new Map(filledValues.map(item => [item.fieldId, item.value]));
      for (let data of customFields) {
        const fieldValue = filledValuesMap.get(data.fieldId);
        const customField = {
          fieldId: data.fieldId,
          label: data.label,
          value: fieldValue || '',
          options: data?.fieldParams?.['options'] || {},
          type: data.type || ''
        };
        customFieldsArray.push(customField);
      }
      result.userData['customFields'] = customFieldsArray;

      return new SuccessResponse({
        statusCode: HttpStatus.OK,
        message: 'Ok.',
        data: result,
      });

    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async getUsersDetailsByCohortId(userData: Record<string, string>, response: any) {
    let apiId = 'api.users.getAllUsersDetails'
    try {
      if (userData.fieldValue) {
        let getUserDetails = await this.findUserName(userData.cohortId, userData.contextType)
        let result = {
          userDetails: [],
        };

        for (let data of getUserDetails) {
          let userDetails = {
            userId: data.userId,
            userName: data.userName,
            name: data.name,
            role: data.role,
            district: data.district,
            state: data.state,
            mobile: data.mobile,
          }
          result.userDetails.push(userDetails);
        }

        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: 'Ok.',
          data: result,
        });

      } else {
        let getUserDetails = await this.findUserName(userData.cohortId, userData.contextType)
        let result = {
          userDetails: [],
        };

        for (let data of getUserDetails) {
          let userDetails = {
            userId: data.userId,
            userName: data.userName,
            name: data.name,
            role: data.role,
            district: data.district,
            state: data.state,
            mobile: data.mobile,
            customField: [],
          }
          const fieldValues = await this.getFieldandFieldValues(data.userId)

          userDetails.customField.push(fieldValues);

          result.userDetails.push(userDetails);
        }

        return new SuccessResponse({
          statusCode: HttpStatus.OK,
          message: 'Ok.',
          data: result,
        });

      }

    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async findUserName(cohortId: string, role: string) {
    let query = `SELECT U."userId", U.username, U.name, U.role, U.district, U.state,U.mobile FROM public."CohortMembers" CM   
    LEFT JOIN public."Users" U 
    ON CM."userId" = U."userId"
    where CM."cohortId" =$1 `
    if (role !== null) {
      query += ` AND U."role" = $2`;
    }
    let result: any[];
    if (role !== null) {
      result = await this.usersRepository.query(query, [cohortId, role]);
    } else {
      result = await this.usersRepository.query(query, [cohortId]);
    }
    return result;
  }

  async getFieldandFieldValues(userId: string) {
    let query = `SELECT Fv."fieldId",F."label" AS FieldName,Fv."value" as FieldValues 
    FROM public."FieldValues" Fv   
    LEFT JOIN public."Fields" F
    ON F."fieldId" = Fv."fieldId"
    where Fv."itemId" =$1 `
    let result = await this.usersRepository.query(query, [userId]);
    return result
  }

  async findUserDetails(userId, username?: any) {
    let whereClause: any = { userId: userId };
    if (username && userId === null) {
      delete whereClause.userId;
      whereClause.username = username;
    }
    let userDetails = await this.usersRepository.findOne({
      where: whereClause
    })
    return userDetails;
  }
  async findCustomFields(userData, role) {
    let customFields = await this.fieldsRepository.find({
      where: {
        context: userData.context,
        contextType: role.toUpperCase()
      }
    })
    return customFields;
  }
  async findFilledValues(userId: string) {
    let query = `SELECT U."userId",F."fieldId",F."value" FROM public."Users" U 
    LEFT JOIN public."FieldValues" F
    ON U."userId" = F."itemId" where U."userId" =$1`;
    let result = await this.usersRepository.query(query, [userId]);
    return result;
  }

  async updateUser(userDto, response) {
    try {
      let updatedData = {};
      if (userDto.userData || Object.keys(userDto.userData).length > 0) {
        await this.updateBasicUserDetails(userDto.userId, userDto.userData);
        updatedData['basicDetails'] = userDto.userData;
      }
      if (userDto.customFields.length > 0) {
        for (let data of userDto.customFields) {
          const result = await this.updateCustomFields(userDto.userId, data);
          if (result) {
            if (!updatedData['customFields'])
              updatedData['customFields'] = [];
            updatedData['customFields'].push(result);
          }
        }
      }
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: updatedData,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage: e,
      });
    }
  }

  async updateBasicUserDetails(userId, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { userId: userId } });
    if (!user) {
      return null;
    }
    Object.assign(user, userData);

    return this.usersRepository.save(user);
  }

  async updateCustomFields(itemId, data) {
    let result = await this.fieldsValueRepository.update({ itemId, fieldId: data.fieldId }, { value: data.value });
    let newResult;
    if (result.affected === 0) {
      newResult = await this.fieldsValueRepository.save({
        itemId,
        fieldId: data.fieldId,
        value: data.value
      });
    }
    Object.assign(result, newResult);
    return result;
  }

  async createUser(request: any, userCreateDto: UserCreateDto) {
    // It is considered that if user is not present in keycloak it is not present in database as well
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      let cohortId = userCreateDto.cohortId;
      delete userCreateDto?.cohortId;
      userCreateDto.createdBy = decoded?.sub
      userCreateDto.updatedBy = decoded?.sub

      userCreateDto.username = userCreateDto.username.toLocaleLowerCase();
      const userSchema = new UserCreateDto(userCreateDto);

      let errKeycloak = "";
      let resKeycloak = "";

      const keycloakResponse = await getKeycloakAdminToken();
      const token = keycloakResponse.data.access_token;
      let checkUserinKeyCloakandDb = await this.checkUserinKeyCloakandDb(userCreateDto)
      let checkUserinDb = await this.checkUserinKeyCloakandDb(userCreateDto.username);
      if (checkUserinKeyCloakandDb) {
        return new ErrorResponseTypeOrm({
          statusCode: HttpStatus.FORBIDDEN,
          errorMessage: "User Already Exist",
        });
      }
      resKeycloak = await createUserInKeyCloak(userSchema, token).catch(
        (error) => {
          errKeycloak = error.response?.data.errorMessage;

          return new ErrorResponseTypeOrm({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorMessage: error,
          });
        }
      );
      userCreateDto.userId = resKeycloak;
      let result = await this.createUserInDatabase(request, userCreateDto, cohortId);
      
      let field_value_array = userCreateDto.fieldValues?.split("|");
      let fieldData = {};
      if (result && field_value_array?.length > 0) {
        let userId = result?.userId;
        for (let i = 0; i < field_value_array?.length; i++) {
          let fieldValues = field_value_array[i].split(":");
          fieldData = {
            fieldId: fieldValues[0],
            value: fieldValues[1]
          }
          let result = await this.updateCustomFields(userId, fieldData);
          if (!result) {
            return new ErrorResponseTypeOrm({
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
              errorMessage:  `Error is ${result}`,
            });
          }
        }
      }
      return new SuccessResponse({
        statusCode: 200,
        message: "ok",
        data: result,
      });
    } catch (e) {
      return new ErrorResponseTypeOrm({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        errorMessage:  `Error is ${e}`,
      });
    }
  }

  // Can be Implemeneted after we know what are the unique entties
  async checkUserinKeyCloakandDb(userDto) {
    const keycloakResponse = await getKeycloakAdminToken();
    const token = keycloakResponse.data.access_token;
    const usernameExistsInKeycloak = await checkIfUsernameExistsInKeycloak(
      userDto.username,
      token
    );
    if (usernameExistsInKeycloak.data.length > 0) {
      return usernameExistsInKeycloak;
    }
    return false;
  }

  async createUserInDatabase(request: any, userCreateDto: UserCreateDto, cohortId) {
    const user = new User()
    user.username = userCreateDto?.username
    user.name = userCreateDto?.name
    user.role = userCreateDto?.role
    user.mobile = Number(userCreateDto?.mobile) || null,
    user.tenantId = userCreateDto?.tenantId
    user.createdBy = userCreateDto?.createdBy
    user.updatedBy = userCreateDto?.updatedBy
    user.userId = userCreateDto?.userId,
    user.state = userCreateDto?.state,
    user.district = userCreateDto?.district,
    user.address = userCreateDto?.address,
    user.pincode = userCreateDto?.pincode

    if (userCreateDto?.dob) {
      user.dob = new Date(userCreateDto.dob);
    }

    let result = await this.usersRepository.save(user);
    if (result) {
      let cohortData = {
        userId: result?.userId,
        role: result?.role,
        // createdBy:result?.userId,
        // updatedBy:result?.userId,
        tenantId: result?.tenantId,
        cohortId: cohortId
      }
      await this.addCohortMember(cohortData);
    }
    return result;
  }

  async addCohortMember(cohortData) {
    try {
      let result = await this.cohortMemberRepository.insert(cohortData);
      return result;;
    } catch (error) {
      throw new Error(error)
    }
  }

  public async resetUserPassword(
    request: any,
    username: string,
    newPassword: string
  ) {
    try {
      const userData: any = await this.findUserDetails(null, username);
      let userId;

      if (userData?.userId) {
        userId = userData?.userId;
      } else {
        return new ErrorResponse({
          errorCode: `404`,
          errorMessage: "User with given username not found",
        });
      }

      // const data = JSON.stringify({
      //   temporary: "false",
      //   type: "password",
      //   value: newPassword,
      // });

      const keycloakResponse = await getKeycloakAdminToken();
      const resToken = keycloakResponse.data.access_token;
      let apiResponse;

      try {
        apiResponse = await this.resetKeycloakPassword(
          request,
          resToken,
          newPassword,
          userId
        );
      } catch (e) {
        return new ErrorResponse({
          errorCode: `${e.response.status}`,
          errorMessage: e.response.data.error,
        });
      }

      if (apiResponse.statusCode === 204) {
        return new SuccessResponse({
          statusCode: apiResponse.statusCode,
          message: apiResponse.message,
          data: apiResponse.data,
        });
      } else {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: apiResponse.errors,
        });
      }
    } catch (e) {
      return e;
    }
  }
  public async resetKeycloakPassword(
    request: any,
    token: string,
    newPassword: string,
    userId: string
  ) {
    const data = JSON.stringify({
      temporary: "false",
      type: "password",
      value: newPassword,
    });

    if (!token) {
      const response = await getKeycloakAdminToken();
      token = response.data.access_token;
    }

    let apiResponse;

    const config = {
      method: "put",
      url:
        process.env.KEYCLOAK +
        process.env.KEYCLOAK_ADMIN +
        "/" +
        userId +
        "/reset-password",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: data,
    };

    try {
      apiResponse = await this.axios(config);
    } catch (e) {
      return new ErrorResponse({
        errorCode: `${e.response.status}`,
        errorMessage: e.response.data.error,
      });
    }

    if (apiResponse.status === 204) {
      return new SuccessResponse({
        statusCode: apiResponse.status,
        message: apiResponse.statusText,
        data: { msg: "Password reset successful!" },
      });
    } else {
      return new ErrorResponse({
        errorCode: "400",
        errorMessage: apiResponse.errors,
      });
    }
  }

}





