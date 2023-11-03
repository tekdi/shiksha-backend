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
        insert_fields_one(object: {${query}}) {
          field_id
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
        fields(
          where:{
            TenantId:{
              _eq:$tenantId
            }
            field_id:{
              _eq:$fieldsId
            },
          }
        ){
          TenantId
          field_id
          asset_id
          context
          context_id
          group_id
          name
          label
          default_value
          type
          note
          description
          state
          required
          ordering
          metadata
          access
          only_use_in_subform
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

  async searchFields(tenantId: string, fieldsSearchDto: FieldsSearchDto) {
    var axios = require("axios");

    let offset = 0;
    if (fieldsSearchDto.page > 1) {
      offset = parseInt(fieldsSearchDto.limit) * (fieldsSearchDto.page - 1);
    }

    let temp_filters = fieldsSearchDto.filters;
    //add tenantid
    let filters = new Object(temp_filters);
    filters["TenantId"] = { _eq: tenantId ? tenantId : "" };

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
           fields(where:$filters, limit: $limit, offset: $offset,) {
              TenantId
              field_id
              asset_id
              context
              context_id
              group_id
              name
              label
              default_value
              type
              note
              description
              state
              required
              ordering
              metadata
              access
              only_use_in_subform
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
        update_fields_by_pk(
            pk_columns: {
                field_id: $fieldsId
            },
            _set: {
                ${query}
            }
        ) {
            field_id
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
        insert_field_values_one(object: {${query}}) {
          id
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
        field_values(
          where:{
            id:{
              _eq:$id
            },
          }
        ){
            field_id
            value
            item_id
            id
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

  public async getFieldValuesItemId(item_id: any) {
    var axios = require("axios");

    var data = {
      query: `query GetFieldValuesItemId($item_id:String!) {
        field_values(
          where:{
            item_id:{
              _eq:$item_id
            },
          }
        ){
            field_id
            value
            item_id
            id
      }
    }`,
      variables: {
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
           field_values(where:$filters, limit: $limit, offset: $offset,) {
                field_id
                value
                item_id
                id
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
        update_field_values_by_pk(
            pk_columns: {
                id: $id
            },
            _set: {
                ${query}
            }
        ) {
            id
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
