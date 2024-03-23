import { Injectable } from '@nestjs/common';
import axios from 'axios';
import qs from 'qs'



@Injectable()
@Injectable()
export class AuthService {
  private axiosInstance; 
  constructor(){
    this.axiosInstance = axios.create();
  }
  
  async login(authDto,response){
    try{
    const { KEYCLOAK, KEYCLOAK_USER_TOKEN, KEYCLOAK_HASURA_CLIENT_SECRET } = process.env;
    const data = qs.stringify({
        username: authDto.username,
        password: authDto.password,
        grant_type: "password",
        client_id: "hasura",
        client_secret: KEYCLOAK_HASURA_CLIENT_SECRET,
      });

      const axiosConfig = {
        method: "post",
        url: `${KEYCLOAK}${KEYCLOAK_USER_TOKEN}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };

      const res = await this.axiosInstance(axiosConfig);
      return response.status(200).send(res.data);
  } catch (error) {
    console.error(error);
    return response.status(500).send({ message: 'An error occurred during login.' });
  }
  }
}