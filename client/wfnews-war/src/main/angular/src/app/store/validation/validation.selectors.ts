import { ComponentId } from "../../config/validation-path-mapping";
import {RootState} from "../index";

export const selectIncidentFormValidationState = (formId:string) =>
  (state: RootState) => (state.imValidationState) ? state.imValidationState[formId] : null;

export const selectIncidentComponentValidationState = (formId:string, componentId:ComponentId) =>
  (state: RootState) => (state.imValidationState) && state.imValidationState[formId] ? state.imValidationState[formId][componentId] : null;