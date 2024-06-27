export interface Option {
    name: string;
    order: string;
    value: string;
}

export interface FieldAttributes {
    // [key: string]: any;
    isRequired: boolean;
    isEditable: boolean;
    isPIIField?: boolean;
    isMultiSelect?: boolean;
    maxSelections?: number
}

export interface FieldParams {
    options : Option[]
}

export abstract class Field {
    constructor(protected fieldAttributes: FieldAttributes,
        protected fieldParams?: FieldParams
    ) {}

    abstract validate(value: any): boolean;
}
