import { ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user-entity'
import { FieldValues } from './entities/field-value-entities';
import ApiResponse from '../utils/response'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user-create.dto';
import jwt_decode from "jwt-decode";
import {
  getUserRole,
  getKeycloakAdminToken,
  createUserInKeyCloak,
  checkIfUsernameExistsInKeycloak,
} from "../common/utils/keycloak.adapter.util"
import { FieldValuesCreateDto } from 'src/fields/dto/field-values-create.dto';
import { ErrorResponse } from 'src/error-response';
import { SuccessResponse } from 'src/success-response';
import { Field } from './entities/field-entity';
import APIResponse from '../utils/response';
import { CohortMembers } from 'src/cohortMembers/entities/cohort-member.entity';
import { v5 as uuidv5 } from 'uuid';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { AnyARecord } from 'dns';
import { CohortSearchDto } from 'src/cohort/dto/cohort-search.dto';


@Injectable()
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FieldValues)
    private fieldsValueRepository: Repository<FieldValues>,
    @InjectRepository(Field)
    private fieldsRepository: Repository<Field>,
    @InjectRepository(CohortMembers)
    private cohortMemberRepository: Repository<CohortMembers>
  ) { }
  async getUsersDetailsByCohortId(userData: Record<string, string>, response) {
    let apiId = 'api.users.getAllUsersDetails'
    // console.log(userData);
    try {
      let getUserDetails = await this.findUserName(userData.cohortId)
      // console.log(getUserDetails);
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
        const fieldValues = await this.getFieldValues(data.userId)

        userDetails.customField.push(fieldValues);

        result.userDetails.push(userDetails);
      }

      return response
        .status(HttpStatus.OK)
        .send(APIResponse.success(apiId, result, 'OK'));

    } catch (e) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            'Something went wrong In finding UserDetails',
            e,
            'INTERNAL_SERVER_ERROR',
          ),
        );
    }
  }

  async findUserName(cohortId: string) {
    let query = `SELECT U."userId", U.username, U.name, U.role, U.district, U.state,U.mobile FROM public."CohortMembers" CM   
    LEFT JOIN public."Users" U 
    ON CM."userId" = U."userId"
    where CM."cohortId" =$1 `
    let result = await this.usersRepository.query(query, [cohortId]);
    return result;
  }

  async getFieldValues(userId: string) {
    let query = `SELECT Fv."fieldId",F."label" AS FieldName,Fv."value" as FieldValues 
    FROM public."FieldValues" Fv   
    LEFT JOIN public."Fields" F
    ON F."fieldId" = Fv."fieldId"
    where Fv."itemId" =$1 `
    // console.log(query);
    // console.log(userId);
    
    
    let result = await this.usersRepository.query(query, [userId]);
    return result
  }
  async getUsersDetailsById(userData: Record<string, string>, response) {
    let apiId = 'api.users.getUsersDetails'
    try {
      const result = {
        userData: {
        }
      };
      let customFieldsArray = [];
      const [customFields, filledValues, userDetails] = await Promise.all([
        this.findCustomFields(userData),
        this.findFilledValues(userData.userId),
        this.findUserDetails(userData.userId)
      ]);
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
      return response
        .status(HttpStatus.OK)
        .send(APIResponse.success(apiId, result, 'OK'));
    } catch (e) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            'Something went wrong In finding UserDetails',
            e,
            'INTERNAL_SERVER_ERROR',
          ),
        );
    }
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
  async findCustomFields(userData) {
    let customFields = await this.fieldsRepository.find({
      where: {
        context: userData.context,
        contextType: userData.contextType
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
    const apiId = 'api.users.UpdateUserDetails'
    try {
      let updatedData = {};
      if (userDto.userData || Object.keys(userDto.userData).length > 0) {
        await this.updateBasicUserDetails(userDto.userId, userDto.userData);
        updatedData['basicDetails'] = userDto.userData;
      }
      if (userDto.customFields.length > 0) {
        for (let data of userDto.customFields) {
          console.log(data);
          const result = await this.updateCustomFields(userDto.userId, data);
          if (result) {
            if (!updatedData['customFields'])
              updatedData['customFields'] = [];
            updatedData['customFields'].push(result);
          }
        }
      }
      return response
        .status(HttpStatus.OK)
        .send(APIResponse.success(apiId, updatedData, 'OK'));
    } catch (e) {
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(
          APIResponse.error(
            apiId,
            'Something went wrong In finding UserDetails',
            e,
            'INTERNAL_SERVER_ERROR',
          ),
        );
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
    let apiId = 'api.user.creatUser'
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userId = decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      let cohortId = userCreateDto.cohortId;
      delete userCreateDto?.cohortId;
      userCreateDto.createdBy = userId
      userCreateDto.updatedBy = userId;

      userCreateDto.username = userCreateDto.username.toLocaleLowerCase();

      const userSchema = new UserCreateDto(userCreateDto);

      let errKeycloak = "";
      let resKeycloak = "";

      const keycloakResponse = await getKeycloakAdminToken();
      const token = keycloakResponse.data.access_token;
      let checkUserinKeyCloakandDb = await this.checkUserinKeyCloakandDb(userCreateDto)
      if (checkUserinKeyCloakandDb) {
        return new ErrorResponse({
          errorCode: "400",
          errorMessage: "User Already Exists",
        });
      }
      resKeycloak = await createUserInKeyCloak(userSchema, token).catch(
        (error) => {
          errKeycloak = error.response?.data.errorMessage;

          return new ErrorResponse({
            errorCode: "500",
            errorMessage: "Someting went wrong",
          });
        }
      );
      userCreateDto.userId = resKeycloak;
      let result = await this.createUserInDatabase(request, userCreateDto, cohortId);
      let field_value_array = userCreateDto.fieldValues?.split("|");
      let fieldData = {};
      if (result && field_value_array?.length > 0) {
        let userId = result.userId;
        for (let i = 0; i < field_value_array?.length; i++) {
          let fieldValues = field_value_array[i].split(":");
          fieldData = {
            fieldId: fieldValues[0],
            value: fieldValues[1]
          }
          let result = await this.updateCustomFields(userId, fieldData);
          if (!result) {
            return new ErrorResponse({
              errorCode: "500",
              errorMessage: `Error is ${result}`,
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
      return new ErrorResponse({
        errorCode: "500",
        errorMessage: `Error is ${e}`,
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
    user.mobile = Number(userCreateDto?.mobile),
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
      console.log(error);
      throw new Error(error)
    }
  }
}





