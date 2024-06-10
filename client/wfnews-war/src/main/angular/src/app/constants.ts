/* eslint-disable @typescript-eslint/naming-convention */
export const INCIDENT_TYPE_CODES = {
  AGENCY_ASSIST: 'AGY_ASSIST',
  DUPLICATE: 'DUPLICATE',
  ENTERED_IN_ERROR: 'ERROR',
  FIRE: 'FIRE',
  FIELD_ACTIVITY: 'FLD_TRAIN',
  NUISANCE_FIRE: 'NUSFIRE',
  OTHER: 'OTHER',
  SMOKE_CHASE: 'SMOKE_CHS',
};

export const STAGE_OF_CONTROL_CODES = {
  BEING_HELD: 'HOLDING',
  OUT: 'OUT',
  OUT_OF_CONTROL: 'OUT_CNTRL',
  UNDER_CONTROL: 'UNDR_CNTRL',
};

export const INCIDENT_STATUS_CODES = {
  ACTIVE: 'Active',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  LOCKED: 'Locked',
};

export const DISCLAIMER_TEXT = {
  // eslint-disable-next-line max-len
  RESPONSE: 'The BC Wildfire Service relies on thousands of people each year to respond to wildfires. This includes firefighters, air crew, equipment operators, and support staff. For more information on resources assigned to this incident, please contact the information officer listed for this incident.',
  INCIDENT_MANAGEMENT: 'An Incident Management Team has been assigned to this wildfire.',
};
