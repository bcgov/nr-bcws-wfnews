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
  getBcwsGeneralDisclaimer: (externalAppConfig: any) => `The wildfire incident data described below is updated when practicable and the occurrence of individual fire updates will vary. The information is intended for general purposes only and should not be relied on as accurate, because fires are dynamic and circumstances may change quickly. This map was designed to keep people in B.C. informed about the current wildfire situation. It is not intended to be used as a risk assessment tool for insurance purposes.<br><br>Wildfire perimeters for the current fire season, including both active fires and fires that have been declared out, are obtained from various sources. When data becomes available, it is refreshed from operational systems every five minutes to the public map. The levels of current fire activity within the mapped fire perimeters can vary widely, so therefore the data may not reflect the current fire situation. This information should only be used for reference purposes. In the event that the fire perimeters overlay areas where private property or infrastructure is present, the perimeters do not indicate what level of damage (if any) may have occurred.<br><br>The Province receives Evacuation Orders and Alerts information from local governments and First Nations when it becomes available. The BC Wildfire Service and GeoBC make no warranties or guarantees, either expressed or implied, as to the completeness, accuracy or correctness of the data, nor accept any liability arising from any incorrect, incomplete or misleading information contained therein. Emergency data may not reflect the current emergency situation, and therefore should only be used for reference purposes. For the latest Evacuation Orders and Alerts information, please consult the appropriate local government. For further information regarding the Evacuation Orders and Alerts data, please contact the individual(s) identified in the <a href="https://catalogue.data.gov.bc.ca/dataset/7efd46d0-b5d3-4dff-af80-d376c42aec33">data catalogue.</a><br><br>The "Fire Bans" layer of this map shows the outer boundaries of lands subject to BC Wildfire Service prohibition orders. Some orders may exclude specific areas, like municipalities, within the outer boundaries but these exclusions are not displayed on the map. To verify excluded areas, check <a href="https://blog.gov.bc.ca/bcwildfire/category/information-bulletins/">current prohibition orders.</a><br><br>Municipalities and local governments may have separate fire bans or restrictions. These bans and restrictions are not shown on the map. Contact local governments before lighting any fire. The "Fire Danger Rating" layer on this map is intended for general information only and should not be relied on as accurate for a specific location due to variability in local site and weather conditions. Information is updated on a daily basis as soon as is practicable. Where discrepancies exist between this layer and the source information located on the <a href="${externalAppConfig['fireDangerUrl'].toString()}">Fire Danger Rating</a> webpage, the source information shall take precedence. For regulated forest operations, the danger class value must be derived from weather data representative of the site on which operations are being conducted. Where discrepancies exist between the colour display on the weather maps and the numerical values posted for the weather stations, the posted numerical values shall take precedence.<br><br>More information regarding the <a href="${externalAppConfig['bansCat3OpenFireUrl'].toString()}">Open Fire Tracking System (OFTS),</a> <a href="${externalAppConfig['hazardAssessmentUrl'].toString()}">Fuel Hazard Assessment and Abatement,</a> <a href="${externalAppConfig['culturalPrescribedFireUrl'].toString()}">Prescribed Burning,</a> and <a href="${externalAppConfig['fireWeatherUrl'].toString()}">Weather Stations</a> can be found on the corresponding webpages.<br><br>Coordinates provided within the datasets are approximate (based on information provided by outside sources and agencies) and are updated when practicable. The actual extent of wildfires and treatment areas may be different than what is indicated by the provided coordinates.<br><br>Data Catalogue:<ul><li><a href="https://catalogue.data.gov.bc.ca/dataset/2790e3f7-6395-4230-8545-04efb5a18800">Fire Points</a></li><li><a href="https://catalogue.data.gov.bc.ca/dataset/cdfc2d7b-c046-4bf0-90ac-4897232619e1">Fire Perimeters</a></li><li><a href="https://www.drivebc.ca/">DriveBC</a></li><li><a href="https://www.emergencyinfobc.gov.bc.ca/">EmergencyInfoBC</a></li><li><a href="${externalAppConfig['agolTermsOfUseUrl'].toString()}">B.C. Map Hub Terms of Use</a></li><li><a href="${externalAppConfig['wildfireStatusUrl'].toString()}">Wildfire Status</a></li><li><a href="https://www.facebook.com/BCForestFireInfo/">Facebook</a></li><li><a href="https://firesmartbc.ca/">FireSmart BC</a></li></ul><br>To report a wildfire, call 1 800 663-5555 toll-free OR *5555 on most cellular networks.<br><a href="${externalAppConfig['disclaimerUrl'].toString()}">Province of British Columbia Disclaimer</a>`,
  PROVINCE_DISCLAIMER_LABEL: 'Province of British Columbia Disclaimer',
};

export const NOTIFICATION_TEXTS = {
  FIRE_PROHIBITION_NEAR_SAVED_LOCATION: 'There is a new fire prohibition in %s Fire Centre near your saved location %s. Tap for more info.',
};

export const INFORMATION_TEXTS = {
  MUNICIPALITY_INFO: `In a municipality, fire and other activities are regulated through local bylaws. <br><br>The best source for information related to evacuations and local fire bans is the responsible municipality, First Nation or local authority.`,
  BCWS_BANS_APPLY_LAND_INFO: `BC Wildfire Service fire bans (prohibitions) apply to land specified in legal orders and information bulletins issued by the BC Wildfire Service. <br><br>Check with local authorities for fire ban information within their boundaries. `,
  BANS_DECISION_INFO: `Fire bans (prohibitions) apply to land specified in legal orders and information bulletins issued by the BC Wildfire Service. <br><br>Decisions on when and where to implement fire bans are made by B.C.’s regional fire centres depending on local fire hazards, forecasted weather conditions and the type and level of fire activity occurring.`,
  LEGAL_ORDERS_INFO_BULLETIN: `Find more information about specific legal orders in the fire ban information bulletin.`,
  BEST_SOURCE_EVAC_BANS_LOCAL_AUTHORITY: `The best source for information related to evacuations and local fire bans is the responsible municipality, regional district, First Nation or local authority.`,
  REGIONAL_DISTRICTS_BANS_INFO: `In addition to BC Wildfire Service fire bans (prohibitions), some regional districts ban fire and other activities within certain areas. <br><br>The best source for information related to evacuations and local fire bans is the responsible municipality, regional district, First Nation or local authority.`,
};

export const CARD_TEXTS = {
  TALK_TO_YOUR_LOCAL_AUTHORITY: 'Regardless of whether a BC Wildfire Service fire ban is in effect, you must always check with local government authorities for local fire bans. <br><br> Municipalities, some regional districts and some land managed by First Nations’ governments have bylaws related to fire and other activities.',
  CAMPGROUNDS: 'BC Wildfire Service fire bans (prohibitions) apply within BC Parks. Search the BC Parks Active Advisories webpage for park-specific information and advisories. <br><br> Always check the local campfire policy for the campground you are visiting.',
};
