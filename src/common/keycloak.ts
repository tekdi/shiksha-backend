function getUserRole(userRoles: string[]) {
    if (userRoles.includes("systemAdmin")) {
      return "systemAdmin";
    } else if (userRoles.includes("facilitator")) {
      return "facilitator";
    } else if (userRoles.includes("beneficiary")) {
      return "beneficiary";
    } else return "user";
  }
  
  function getUserGroup(role: string) {
    switch (role) {
      case "systemAdmin":
        return "systemAdmin";
      case "facilitator":
        return "facilitator";
      default:
        return "beneficiary";
    }
  }
  
  async function getKeycloakAdminToken() {
    const axios = require("axios");
    const qs = require("qs");
    const data = qs.stringify({
      username: process.env.KEYCLOAK_USERNAME,
      password: process.env.KEYCLOAK_PASSWORD,
      grant_type: "password",
      client_id: "admin-cli",
    });
  
    const config = {
      method: "post",
      url: process.env.KEYCLOAK + process.env.KEYCLOAK_ADMIN_TOKEN,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };
  
    let res;
    try {
      res = await axios(config);
    } catch (error) {
      console.log(error, "err");
    }
  
    return res;
  }
  
  async function createUserInKeyCloak(query, token) {
    const axios = require("axios");
    const name = query.name;
    const nameParts = name.split(" ");
    let lname = "";
  
    if (nameParts[2]) {
      lname = nameParts[2];
    } else if (nameParts[1]) {
      lname = nameParts[1];
    }
    if (!query.password) {
      return "User cannot be created, Password missing";
    }
  
    const data = JSON.stringify({
      firstName: nameParts[0],
      lastName: lname,
      enabled: "true",
      username: query.username,
      groups: [getUserGroup(query.role)],
      credentials: [
        {
          temporary: "false",
          type: "password",
          value: query.password,
        },
      ],
    });
  
    const config = {
      method: "post",
      url: process.env.KEYCLOAK + process.env.KEYCLOAK_ADMIN,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      data: data,
    };
  
    let userResponse;
    try {
      userResponse = await axios(config);
    } catch (e) {
      console.log(e.response, "Keycloak Creation error");
      return e;
    }
  
    const userString = userResponse.headers.location;
    const index = userString.lastIndexOf("/");
    const userId = userString.substring(index + 1);
  
    return userId;
  }
  
  async function checkIfEmailExistsInKeycloak(email, token) {
    const axios = require("axios");
    const config = {
      method: "get",
      url: process.env.KEYCLOAK + process.env.KEYCLOAK_ADMIN + `?email=${email}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
    let userResponse;
    try {
      userResponse = await axios(config);
    } catch (e) {
      console.log(e, "Keycloak error - email");
      return e;
    }
  
    return userResponse;
  }
  
  async function checkIfUsernameExistsInKeycloak(username, token) {
    // console.log(username);
    const axios = require("axios");
    const config = {
      method: "get",
      url:
        process.env.KEYCLOAK +
        process.env.KEYCLOAK_ADMIN +
        `?username=${username}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
  
    let userResponse;
    try {
      userResponse = await axios(config);
    } catch (e) {
      console.log(e, "Keycloak error - username");
      return e;
    }
  
    return userResponse;
  }
  
  export {
    getUserGroup,
    getUserRole,
    getKeycloakAdminToken,
    createUserInKeyCloak,
    checkIfEmailExistsInKeycloak,
    checkIfUsernameExistsInKeycloak,
  };
  