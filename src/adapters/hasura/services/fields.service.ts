import { Injectable } from "@nestjs/common";
import { FieldsDto } from "src/fields/dto/fields.dto";
import { FieldsSearchDto } from "src/fields/dto/fields-search.dto";
import { FieldValuesDto } from "src/fields/dto/field-values.dto";
import { FieldValuesSearchDto } from "src/fields/dto/field-values-search.dto";

@Injectable()
export class FieldsService {
  constructor() {}

  //fields
  async createFields(fieldsDto: FieldsDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldsDto).forEach((e) => {
      if (fieldsDto[e] && fieldsDto[e] != "") {
        if (Array.isArray(fieldsDto[e])) {
          query += `${e}: "${JSON.stringify(fieldsDto[e])}", `;
        } else {
          query += `${e}: "${fieldsDto[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateFields {
        insert_Fields_one(object: {${query}}) {
          fieldId
        }
      }
      `,
      variables: {},
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  public async getFields(tenantId: string, fieldsId: any) {
    var axios = require("axios");

    var data = {
      query: `query GetFields($fieldsId:uuid!, $tenantId:uuid!) {
        Fields(
          where:{
            tenantId:{
              _eq:$tenantId
            }
            fieldId:{
              _eq:$fieldsId
            },
          }
        ){
          tenantId
          fieldId
          assetId
          context
          contextId
          groupId
          name
          label
          defaultValue
          type
          note
          description
          state
          required
          ordering
          metadata
          access
          onlyUseInSubform
          createdAt
          updatedAt
          createdBy
          updatedBy
      }
    }`,
      variables: {
        fieldsId: fieldsId,
        tenantId: tenantId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  public async getFieldsContext(
    tenantId: string,
    context: string,
    contextId: string
  ) {
    var axios = require("axios");

    var data = {
      query: `query GetFields($context:String!, $contextId:String!, $tenantId:uuid!) {
        Fields(
          where:{
            tenantId:{
              _eq:$tenantId
            }
            context:{
              _eq:$context
            }
            contextId:{
              _in: [ $contextId, "0"]
            },
          }
        ){
          tenantId
          fieldId
          assetId
          context
          contextId
          groupId
          name
          label
          defaultValue
          type
          note
          description
          state
          required
          ordering
          metadata
          access
          onlyUseInSubform
          createdAt
          updatedAt
          createdBy
          updatedBy
      }
    }`,
      variables: {
        context: context,
        contextId: contextId,
        tenantId: tenantId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  async searchFields(tenantId: string, fieldsSearchDto: FieldsSearchDto) {
    var axios = require("axios");

    let offset = 0;
    if (fieldsSearchDto.page > 1) {
      offset = parseInt(fieldsSearchDto.limit) * (fieldsSearchDto.page - 1);
    }

    let temp_filters = fieldsSearchDto.filters;
    //add tenantid
    let filters = new Object(temp_filters);
    filters["tenantId"] = { _eq: tenantId ? tenantId : "" };

    Object.keys(fieldsSearchDto.filters).forEach((item) => {
      Object.keys(fieldsSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchFields($filters:fields_bool_exp,$limit:Int, $offset:Int) {
           Fields(where:$filters, limit: $limit, offset: $offset,) {
              tenantId
              fieldId
              assetId
              context
              contextId
              groupId
              name
              label
              defaultValue
              type
              note
              description
              state
              required
              ordering
              metadata
              access
              onlyUseInSubform
              createdAt
              updatedAt
              createdBy
              updatedBy
            }
          }`,
      variables: {
        limit: parseInt(fieldsSearchDto.limit),
        offset: offset,
        filters: fieldsSearchDto.filters,
      },
    };
    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  async updateFields(fieldsId: string, fieldsDto: FieldsDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldsDto).forEach((e) => {
      if (fieldsDto[e] && fieldsDto[e] != "") {
        if (Array.isArray(fieldsDto[e])) {
          query += `${e}: "${JSON.stringify(fieldsDto[e])}", `;
        } else {
          query += `${e}: "${fieldsDto[e]}", `;
        }
      }
    });

    var data = {
      query: `
      mutation UpdateFields($fieldsId:uuid!) {
        update_Fields_by_pk(
            pk_columns: {
              fieldId: $fieldsId
            },
            _set: {
                ${query}
            }
        ) {
          fieldId
        }
    }
    `,
      variables: {
        fieldsId: fieldsId,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    return response;
  }

  //field values
  async createFieldValues(fieldValuesDto: FieldValuesDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldValuesDto).forEach((e) => {
      if (fieldValuesDto[e] && fieldValuesDto[e] != "") {
        if (Array.isArray(fieldValuesDto[e])) {
          query += `${e}: "${JSON.stringify(fieldValuesDto[e])}", `;
        } else {
          query += `${e}: "${fieldValuesDto[e]}", `;
        }
      }
    });

    var data = {
      query: `mutation CreateFieldValues {
        insert_FieldValues_one(object: {${query}}) {
          fieldValuesId
        }
      }
      `,
      variables: {},
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  public async getFieldValues(id: any) {
    var axios = require("axios");

    var data = {
      query: `query GetFieldValues($id:uuid!) {
        FieldValues(
          where:{
            fieldValuesId:{
              _eq:$id
            },
          }
        ){
            value
            fieldValuesId
            itemId
            fieldId
            createdAt
            updatedAt
            createdBy
            updatedBy
      }
    }`,
      variables: {
        id: id,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  public async getFieldValuesFieldsItemId(field_id: string, item_id: string) {
    var axios = require("axios");

    var data = {
      query: `query GetFieldValuesItemId($field_id:uuid!,$item_id:uuid!) {
        FieldValues(
          where:{
            itemId:{
              _eq:$item_id
            },
            fieldId:{
              _eq:$field_id
            },
          }
        ){
            value
            fieldValuesId
            itemId
            fieldId
            createdAt
            updatedAt
            createdBy
            updatedBy
      }
    }`,
      variables: {
        field_id: field_id,
        item_id: item_id,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  async searchFieldValues(fieldValuesSearchDto: FieldValuesSearchDto) {
    var axios = require("axios");

    let offset = 0;
    if (fieldValuesSearchDto.page > 1) {
      offset =
        parseInt(fieldValuesSearchDto.limit) * (fieldValuesSearchDto.page - 1);
    }

    let filters = fieldValuesSearchDto.filters;

    Object.keys(fieldValuesSearchDto.filters).forEach((item) => {
      Object.keys(fieldValuesSearchDto.filters[item]).forEach((e) => {
        if (!e.startsWith("_")) {
          filters[item][`_${e}`] = filters[item][e];
          delete filters[item][e];
        }
      });
    });
    var data = {
      query: `query SearchFieldValues($filters:fields_bool_exp,$limit:Int, $offset:Int) {
          FieldValues(where:$filters, limit: $limit, offset: $offset,) {
              value
              fieldValuesId
              itemId
              fieldId
              createdAt
              updatedAt
              createdBy
              updatedBy
            }
          }`,
      variables: {
        limit: parseInt(fieldValuesSearchDto.limit),
        offset: offset,
        filters: fieldValuesSearchDto.filters,
      },
    };
    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);
    return response;
  }

  async updateFieldValues(id: string, fieldValuesDto: FieldValuesDto) {
    var axios = require("axios");

    let query = "";
    Object.keys(fieldValuesDto).forEach((e) => {
      if (fieldValuesDto[e] && fieldValuesDto[e] != "") {
        if (Array.isArray(fieldValuesDto[e])) {
          query += `${e}: "${JSON.stringify(fieldValuesDto[e])}", `;
        } else {
          query += `${e}: "${fieldValuesDto[e]}", `;
        }
      }
    });

    var data = {
      query: `
      mutation UpdateFieldValues($id:uuid!) {
        update_FieldValues_by_pk(
            pk_columns: {
              fieldValuesId: $id
            },
            _set: {
                ${query}
            }
        ) {
            fieldValuesId
        }
    }
    `,
      variables: {
        id: id,
      },
    };

    var config = {
      method: "post",
      url: process.env.REGISTRYHASURA,
      headers: {
        "x-hasura-admin-secret": process.env.REGISTRYHASURAADMINSECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(config);

    return response;
  }
}
