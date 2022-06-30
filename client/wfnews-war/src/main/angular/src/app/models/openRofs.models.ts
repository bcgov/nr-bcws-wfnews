import {PublicReportOfFireResource} from '@wf1/incidents-rest-api';

export class OpenRofs {
	public state: 'new' | 'saved' | 'unsaved';
	public id: string;
	public rof: PublicReportOfFireResource;
}
