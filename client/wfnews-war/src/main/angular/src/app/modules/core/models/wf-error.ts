export interface WFError {
  status?:number;
	message: string;
	messageArguments?: any[];
	messageTemplate?: string;
	path?: string;
  responseEtag?:string;
}
