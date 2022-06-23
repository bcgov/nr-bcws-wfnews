
export interface IMValidationState {
  [formId:string] : FormValidationState;
}

export interface FormValidationState {
  general: ComponentValidationState;
  fireCharacteristics: ComponentValidationState;
  landAuthority: ComponentValidationState;
  cause: ComponentValidationState;
  ceInvestigation: ComponentValidationState;
  costs: ComponentValidationState;
  rswap: ComponentValidationState;
  history: ComponentValidationState;
  signoff: ComponentValidationState;
  photos: ComponentValidationState;

  uncategorized: ComponentValidationState;
}

export interface ComponentValidationState {
  [path:string]: ValidationErrorState[];
}

export const initialIMValidationState: IMValidationState = {

};

export enum ERROR_TYPE {
  VALIDATION = 'VALIDATION',
  WARNING = 'WARNING',
  FATAL = 'FATAL',
  NOT_FOUND = 'NOT_FOUND',
  FAILED_PRECONDITION = 'FAILED_PRECONDITION'
}

export interface ValidationErrorState {
  type: ERROR_TYPE;
  status: number;
  message: string;
  messageTemplate: string;
  messageArguments: any[];
  displayMessage: string;
  path: string;
  order: number
}

export interface APIValidationError {
  path: string,
  message: string,
  messageTemplate: string,
  messageArguments: any[],
}
