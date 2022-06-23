import {Action} from '@ngrx/store';
import { ComponentId } from '../../config/validation-path-mapping';
import {ComponentValidationState, FormValidationState} from "./validation.state";

export enum IMValidationActions {
  SET_IM_FORM_VALIDATION_STATE = '[ IMValidation ] Set form validation state',
  SET_IM_FORM_COMPONENT_VALIDATION_STATE = '[ IMValidation ] Set form component validation state',
  CLEAR_IM_FORM_VALIDATION_STATE = '[ IMValidation ] Clear form validation state',
  CLEAR_IM_FORM_COMPONENT_VALIDATION_STATE = '[ IMValidation ] Clear form component validation state'
}


export interface SetIMFormValidationState extends Action {
  payload: {
   formId: string;
   formValidation : FormValidationState
  }
}

export interface SetIMFormComponentValidationState extends Action {
  payload: {
    formId: string,
    componentId: string;
    componentValidation: ComponentValidationState;
  }
}

export interface ClearIMFormValidationState extends Action {
  payload: {
    formId: string
  }
}

export interface ClearIMFormComponentValidationState extends Action {
  payload: {
    formId: string,
    componentId: string
  }
}

export function setIMFormValidationState(formId: string, formValidation: FormValidationState) : SetIMFormValidationState{
  return {
    type: IMValidationActions.SET_IM_FORM_VALIDATION_STATE,
    payload:{
      formId,
      formValidation
    }
  }
}

export function setIMFormComponentValidationState(formId, componentId:ComponentId, componentValidation: ComponentValidationState) : SetIMFormComponentValidationState{
  return {
    type: IMValidationActions.SET_IM_FORM_COMPONENT_VALIDATION_STATE,
    payload:{
      formId,
      componentId,
      componentValidation
    }
  }
}

export function clearIMFormValidationState(formId) : ClearIMFormValidationState{
  return {
    type: IMValidationActions.CLEAR_IM_FORM_VALIDATION_STATE,
    payload:{
      formId
    }
  }
}

export function clearIMFormComponentValidationState(formId, componentId:ComponentId) : ClearIMFormComponentValidationState{
  return {
    type: IMValidationActions.CLEAR_IM_FORM_COMPONENT_VALIDATION_STATE,
    payload:{
      formId,
      componentId
    }
  }
}