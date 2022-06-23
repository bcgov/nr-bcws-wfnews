import {SelectableWildfireIncidentResource} from './selectable-wildfire-incident-resource';

export enum ColumnSize {
  SMALL = 'small-table-cell',
  MEDIUM = 'medium-table-cell',
  LARGE = 'large-table-cell',
  XLARGE = 'extra-large-table-cell',
}

export interface IncidentColumnDef {
	title: string;
	name: string;
	size: ColumnSize;
	prop: (row: SelectableWildfireIncidentResource) => any;
	sortable?: boolean;
}
