import {ValidationError} from "../store/application/application.state";

const digits = () => `must contain only numbers`;
const required = () => `is required`;
const invalid = () => `is invalid`;
const notFound = () => `not found`;
const min = ([message, min]: any[]) => `cannot be less than ${min}`;
const max = ([message, max]: any[]) => `cannot be more than ${max}`;
const minMax = ([message, min, max]: any[]) => `must be between ${min} and ${max} characters`;

export const ErrorMessages = {
    "required": () => "Value is required",
    "max": (x) => `Value cannot be more than ${x}`,
    "min": (x) => `Value cannot be less than ${x}`,
    "maxlength": (x) => `Value cannot exceed ${x} characters`,
    "minlength": (x) => `Value must be at least ${x} characters`,
    "signup": () => "Please sign up before proceeding",
    "notsignedup": () => "Employee is currently not signed up",

    "error.employee.number.invalid": () => `The provided employee number doesn't match our records.`,
    "error.registration.email.address.invalid": () => `The provided email address doesn't match our records.`,
    "error.employee.already.registered": () => `The employee matching these details has already been registered to a different account.`,
    "error.diary.entry.is.not.in.an.approval.state": ({messageArguments}: ValidationError) => `Diary entry for ${messageArguments[0]} is not in a supervisor approvable state.`,
};

export function getDisplayErrorMessage(err:ValidationError){
    
    if(err && ErrorMessages[err.message]){
        return ErrorMessages[err.message](err);
    }else if (err && err.messageTemplate && err.messageTemplate != err.message) {
        let msg:string = err.messageTemplate;
        let args = err.messageArguments;
        if(args && args.length > 0){
            err.messageArguments.forEach(function (arg,index)  {
                let paramLookup = '{' + index + '}';
                msg = msg.replace(paramLookup, arg);
            });
        }
        return msg;
    }else{
        return err.message;
    }
}
