import { Injectable } from '@nestjs/common';
import { User } from './entities/user-create-entity'
import { FieldValue } from './entities/field-entities';
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


@Injectable()
@Injectable()
export class UsersService1 {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FieldValue)
    private fieldsValueRepository: Repository<User>
  ) {}

  async getUsers(userID){
    let result = await this.usersRepository.findOne({
        where:{
            userId:userID
        }
    });
    console.log(result);
    return result;
  }

  public async createShubhamUser(request: any, userCreateDto: UserCreateDto) {
    // It is considered that if user is not present in keycloak it is not present in database as well
    try {
      const decoded: any = jwt_decode(request.headers.authorization);
    //   const userRoles = decoded["https://hasura.io/jwt/claims"]["x-hasura-allowed-roles"];
      const userId =decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      userCreateDto.createdBy = userId
      userCreateDto.updatedBy = userId;

      userCreateDto.username = userCreateDto.username.toLocaleLowerCase();

      const userSchema = new UserCreateDto(userCreateDto);

      let errKeycloak = "";
      let resKeycloak = "";

      // if (altUserRoles.includes("systemAdmin")) {

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
      console.error(e);
      return e;
    }
  }

async createUserInDatabase(request: any, userCreateDto: UserCreateDto) {
    let result = await this.usersRepository.save(userCreateDto);
        return new SuccessResponse({
          statusCode: 200,
          message: "Ok.",
          data: result,
        });
      }
    // if(result){
    //     let fieldCreate = true;
    //     let fieldError = null;
    //     //create fields values
    //     let userId = result?.userId;
    //     let field_value_array = userCreateDto.fieldValues?.split("|");
    //     if (field_value_array?.length > 0) {
    //       console.log("Hi");
    //       let field_values = [];
    //       for (let i = 0; i < field_value_array.length; i++) {
    //         let fieldValues = field_value_array[i].split(":");
    //         field_values.push({
    //           value: fieldValues[1] ? fieldValues[1] : "",
    //           itemId: userId,
    //           fieldId: fieldValues[0] ? fieldValues[0] : "",
    //           createdBy: userCreateDto?.createdBy,
    //           updatedBy: userCreateDto?.updatedBy,
    //         });
    //       }
    //       console.log(field_values,"Checking");
    //       const response_field_values = await this.fieldsValueRepository.save(field_values);
    //       console.log(response_field_values);
        }
    
    



