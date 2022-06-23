import {IncidentType, ReportOfFireType} from "@wf1/core-ui";

export interface ListItemConfig {
  icon: string;
  iconColourCode?: IncidentType | ReportOfFireType;
  iconIsBlinking?: boolean;
  iconIsCancelled?: boolean;
  iconIsAssignedToIncident?: boolean;
  time?: string;
  title: string;
  info: Info[];
  location?: [number, number];
  geometry?: any;
  hasAttachments?: boolean
}

export interface Info {
  label: string;
  value: string | number;
  emphasis?:boolean;
  fullWidth?:boolean;
}
