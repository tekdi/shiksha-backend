import { HttpStatus, Injectable } from '@nestjs/common';
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
  } from "../common/keycloak";
import { ErrorResponse } from 'src/error-response';
import { SuccessResponse } from 'src/success-response';
import { Field } from './entities/field-entity';
import APIResponse from '../utils/response';
import { v5 as uuidv5 } from 'uuid';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';


@Injectable()
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FieldValues)
    private fieldsValueRepository: Repository<FieldValues>,
    @InjectRepository(Field)
    private fieldsRepository : Repository<Field>
  ) {}
  
  async getUsersDetailsById(userData:Record<string,string>,response){
    let apiId='api.users.getUsersDetails'
    try {
      const result = {
        customFields: []
    };

    const [customFields, filledValues,userDetails] = await Promise.all([
      this.findCustomFields(userData),
      this.findFilledValues(userData.userId),
      this.findUserDetails(userData.userId)
  ]);
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
        result.customFields.push(customField);
    }
    result['userData']=userDetails;
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

  async findUserDetails(userId){
    let userDetails = await this.usersRepository.findOne({
      where:{
        userId:userId
      }
    })
    return userDetails;
  }
  async findCustomFields(userData){
    let customFields = await this.fieldsRepository.find({
      where:{
        context:userData.context,
        contextType:userData.contextType
      }
    })
    return customFields;
  }
  async findFilledValues(userId:string){
    let query = `SELECT U."userId",F."fieldId",F."value" FROM public."Users" U 
    LEFT JOIN public."FieldValues" F
    ON U."userId" = F."itemId" where U."userId" =$1`;
    let result = await this.usersRepository.query(query,[userId]);
    return result;
  }

  async updateUser(userDto,response){
    const apiId = 'api.users.UpdateUserDetails'
    try {
      let updatedData = {};
      if(userDto.userData || Object.keys(userDto.userData).length > 0){
        await this.updateBasicUserDetails(userDto.userId,userDto.userData);
        updatedData['basicDetails'] = userDto.userData;
      }
      if(userDto.customFields.length > 0){
        for (let data of userDto.customFields) {
          const result = await this.updateCustomFields(userDto.userId, data);
          if (result) {
              if (!updatedData['customFields']) 
              updatedData['customFields']= [];
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

  async updateBasicUserDetails(userId,userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { userId: userId } });
    if (!user) {
      return null;
    }
    Object.assign(user, userData);

    return this.usersRepository.save(user);
  }

  async updateCustomFields(itemId,data){
    const result = await this.fieldsValueRepository.update({ itemId, fieldId: data.fieldId }, { value: data.value });

    if (result.affected === 0) {
        return null;
    }
    return result;
  }

  async createUser(request: any, userCreateDto: UserCreateDto,response) {
    // It is considered that if user is not present in keycloak it is not present in database as well
    let apiId='api.user.creatUser'
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
      const userId =decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      userCreateDto.createdBy = userId
      userCreateDto.updatedBy = userId;

      userCreateDto.username = userCreateDto.username.toLocaleLowerCase();

      const userSchema = new UserCreateDto(userCreateDto);

      let errKeycloak = "";
      let resKeycloak = "";
      
      const keycloakResponse = await getKeycloakAdminToken();
      const token = keycloakResponse.data.access_token;

      resKeycloak = await createUserInKeyCloak(userSchema, token).catch(
        (error) => {
          errKeycloak = error.response?.data.errorMessage;

          return new ErrorResponse({
            errorCode: "500",
            errorMessage: "Someting went wrong",
          });
        }
      ); userCreateDto.userId = resKeycloak;
      return await this.createUserInDatabase(request, userCreateDto);
    } catch (e) {
      response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(
        ApiResponse.error(
          apiId,
          'Something went wrong',
          `Failure Posting Data. Error is: ${e}`,
          'INTERNAL_SERVER_ERROR',
        ),
      );
    }
  }

// Can be Implemeneted after we know what are the unique entties
  async checkUserinKeyCloakandDb(userDto){
  const keycloakResponse = await getKeycloakAdminToken();
  const token = keycloakResponse.data.access_token;
  const usernameExistsInKeycloak = await checkIfUsernameExistsInKeycloak(
        userDto.username,
        token
      );
  if(usernameExistsInKeycloak){
    return usernameExistsInKeycloak;
  }
  }

  async createUserInDatabase(request: any, userCreateDto: UserCreateDto) {
      let userData = {
        username:userCreateDto?.username,
        name:userCreateDto?.name,
        role:userCreateDto.role,
        password:userCreateDto.password,
        mobile:userCreateDto.mobile,
        tenantId:userCreateDto.tenantId,
        createdBy:userCreateDto.createdBy,
        updatedby:userCreateDto.updatedBy,
        userId:userCreateDto.userId,
      }
      let result = await this.usersRepository.create(userData);
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });}
  }
    
    



