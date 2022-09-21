export interface PagedCollection {
    pageNumber?: number;
    pageRowCount?: number;
    totalRowCount?: number;
    totalPageCount?: number;
    collection?: Array<any>;
}

export interface fireCentreOption {
    code?: string;
    fireCentreName?: string;
}

export interface EvacOrderOption {
  eventName?: string;
  eventType?: string;
  orderAlertStatus?: string;
  issuingAgency?: string;
  preOcCode?: string;
  emrgOAAsysID?: number;
  centroid?: any;
}

export interface AreaRestrictionsOption {
  protRsSysID?: number;
  name?: string;
  accessStatusEffectiveDate?: Date;
  fireCentre?: string;
  fireZone?: string;
  bulletinUrl?: string;
  centroid?: any;
}
