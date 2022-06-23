import {Action} from '@ngrx/store';
import {IMValidationState, initialIMValidationState} from "./validation.state";
import {
  ClearIMFormComponentValidationState,
  ClearIMFormValidationState,
  IMValidationActions,
  SetIMFormComponentValidationState,
  SetIMFormValidationState
} from "./validation.actions";

export function imValidationReducer(state: IMValidationState = initialIMValidationState, action: Action) {
  switch (action.type) {
    case IMValidationActions.SET_IM_FORM_VALIDATION_STATE: {
      let typedAction = action as SetIMFormValidationState;
      let imValidationState: IMValidationState = {...state};
      imValidationState[typedAction.payload.formId] = typedAction.payload.formValidation;

      return imValidationState;
    }
    case IMValidationActions.SET_IM_FORM_COMPONENT_VALIDATION_STATE: {
      let typedAction = action as SetIMFormComponentValidationState;
      const formId = typedAction.payload.formId;
      const componentId = typedAction.payload.componentId;
      let ns: IMValidationState = {...state};
      ns[formId][componentId] = typedAction.payload.componentValidation;

      return ns;
    }
    case IMValidationActions.CLEAR_IM_FORM_VALIDATION_STATE: {
      let typedAction = action as ClearIMFormValidationState;
      const formId = typedAction.payload.formId;
      let ns: IMValidationState = {...state};
      delete ns[formId];

      return ns;
    }
    case IMValidationActions.CLEAR_IM_FORM_COMPONENT_VALIDATION_STATE: {
      let typedAction = action as ClearIMFormComponentValidationState;
      const formId = typedAction.payload.formId;
      const componentId = typedAction.payload.componentId;
      let ns: IMValidationState = {...state};

      let formState = ns[formId];
      if(formState && formState[componentId]){
        delete formState[componentId];
      }
      return ns;
    }
    default:
      return state;
  }
}
