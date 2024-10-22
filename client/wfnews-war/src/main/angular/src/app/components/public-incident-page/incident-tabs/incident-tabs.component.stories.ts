// Import necessary Angular modules and decorators
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

// Import your specific component
import { IncidentGalleryPanel } from '../incident-gallery-panel/incident-gallery-panel.component';
import { IncidentInfoPanelComponent } from '../incident-info-panel/incident-info-panel.component';
import { IncidentMapsPanel } from '../incident-maps-panel/incident-maps-panel.component';
import { IncidentOverviewPanel } from '../incident-overview-panel/incident-overview-panel.component';
import { IncidentTabsComponent } from './incident-tabs.component';

// Mock data for the story
const mockIncident = {
    cacheExpiresMillis: null,
    links: [
        {
            rel: 'self',
            href: 'http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident',
            method: 'GET',
            _type: null
        }
    ],
    publishedIncidentDetailGuid: '2ae55318-a6b7-43be-b947-f6b29130f580',
    incidentGuid: '185C2BDF5C437589E0631D09228E0F61',
    incidentNumberLabel: 'V65041',
    newsCreatedTimestamp: 1715629914000,
    stageOfControlCode: 'HOLDING',
    generalIncidentCauseCatId: 2,
    newsPublicationStatusCode: 'PUBLISHED',
    discoveryDate: 1715629716000,
    declaredOutDate: null,
    fireCentreCode: '50',
    fireCentreName: 'Coastal Fire Centre',
    fireOfNoteInd: true,
    wasFireOfNoteInd: true,
    incidentName: 'Blenkinsop Lake Fire',
    incidentLocation: 'Island in Blenkinsop Lake',
    traditionalTerritoryDetail: 'Blenkinsop FN',
    incidentSizeEstimatedHa: 2.0,
    incidentSizeMappedHa: 2.0,
    incidentSizeDetail: 'Fire size is based on the last known mapped size in hectares.',
    incidentCauseDetail: 'When lightning strikes an object it can release enough heat to ignite a tree or other fuels.',
    wildfireCrewResourcesInd: true,
    wildfireAviationResourceInd: true,
    heavyEquipmentResourcesInd: true,
    incidentMgmtCrewRsrcInd: true,
    structureProtectionRsrcInd: false,
    crewResourceCount: null,
    aviationResourceCount: null,
    heavyEquipmentResourceCount: null,
    incidentManagementResourceCount: null,
    structureProtectionResourceCount: null,
    publishedTimestamp: 1715880522303,
    lastUpdatedTimestamp: 1715880522299,
    createDate: 1715629719759,
    updateDate: 1715880522307,
    latitude: '48.48435',
    longitude: '-123.361566',
    fireYear: 2024,
    responseTypeCode: 'FULL',
    responseTypeDetail: null,
    fireZoneUnitIdentifier: 54,
    // eslint-disable-next-line max-len
    incidentOverview: '<p><u>Weather:</u></p><ul><li>Earlier forecasts suggested strong winds overnight on May 12th for the Fort Nelson area, based on the setup of a default ridge over the North of BC, these winds arrived later than expected.&nbsp;</li><li>The inversion overnight on May 12th led to calm stable conditions over the Fort Nelson area into the late evening/ early morning hours of May 13th.</li><li>Winds were 0-2km/hr and humidifies rose above 50% by the late evening which limited fire behaviour for G90267 to a creeping ground fire.</li><li>G90267 saw almost no overnight growth on the 12th of May.</li><li>Winds aloft picked up in the early morning hours on May 13th for the area, the inversion is expected to break early this morning with an increase in wind speeds following into the later morning/ early afternoon.</li><li>With higher forecasted wind speeds, and the low humidifies extreme fire behaviour is forecasted for the Fort Nelson area on May 13th with the dryness of the available fuels.</li></ul><p><u>Resources:</u>&nbsp;</p><ul style="list-style-type:disc;"><li><span style="color:black;">An Incident Management Team is in operational command of this incident.&nbsp;</span></li><li><span style="background-color:white;color:black;">BC Wildfire Service resources are working in conjunction with&nbsp;</span>The Northern Rockies Municipal Fire Department and emergency services staff.</li><li><span style="background-color:white;color:black;">69 BCWS firefighters are responding to this incident.</span></li><li><span style="background-color:white;color:black;">16 helicopters are assigned to the Fort Nelson Zone and&nbsp;</span><span style="color:black;">fixed wing airtankers are available should they be required for operational objectives.</span></li><li><span style="background-color:white;color:black;">A Structure Protection Branch is established including: four Structure Protection Specialists, two type 2 Structure Protections Trailers and one Type 1 Structure Protection Trailer. &nbsp;</span></li><li><span style="background-color:white;color:black;">17 pieces of heavy equipment are assigned to this incident.&nbsp;</span></li></ul><p><span style="color:black;"><u>Operations:</u></span></p><ul style="list-style-type:disc;"><li>Command and operational staff from the BCWS Incident Management Team remain at the Incident Command Post in Fort Nelson alongside BCWS crews and structure protection personnel.</li><li>The helicopter base has been relocated in order maintain operations due to heavy smoke in the Fort Nelson area.&nbsp;</li><li>Operations continue to be run 24 hour as the Structure Protection Branch remains established and a structure defense plan has been finalized. Structure protection and BCWS personnel are working in two main priority areas: The Fort Nelson First Nation and along the Old Alaska Highway. The Northern Rockies Regional Municipality Fire Department has structure defense resources to respond within their fire response area.</li><li>Overnight, structure protection personnel actioned hot spots adjacent to identified values.</li><li>Located in the Fort Nelson First Nation, two Structure Protection Specialists are working alongside structure protection tenders, engines, structure protection crews and a BC Wildfire Service Unit Crew.</li><li>Located in the Old Alaska Highway, adjacent to Highway 97, a Structure Protection Specialist is supported by a task force.</li><li>BCWS staff continues to work alongside the Northern Rocky Municipal Fire Department as they remain a dedicated task force in their fire protected area.&nbsp;</li><li>Approximately a 200 hectare pocket of available fuel located adjacent to Highway 97 was removed by a planned aerial ignition. BCWS crews supported this planned ignition operation by performing small scale hand ignitions to remove any remaining unburnt fuel and to reinforce containment lines.&nbsp;</li></ul><p><u>Evacuation Alerts and Orders/Highway Closures:</u></p><ul><li>Highway 97 (Alaska Highway) is currently closed north of Fort Nelson. Information on Highway 97 closures can be requested at 250-774-6956 and information on Highway 77 closures can be found on <a href="https://drivebc.ca/">DriveBC</a>.</li><li><span style="background-color:white;color:#272738;">The Northern Rockies Regional Municipality has issued an Evacuation Order for Fort Nelson and area, and the Fort Nelson First Nation, to protect public life and safety. Impacted residents can evacuate to the Fort St. John Reception Centre at the North Peace Arena. More information on the Evacuation Order is available online at </span><a href="https://www.emergencyinfobc.gov.bc.ca/event/10may24/"><span style="background-color:white;color:#272738;">EmergencyInfoBC</span></a><span style="background-color:white;color:#272738;"> and the </span><a href="https://www.northernrockies.ca/en/index.aspx"><span style="background-color:white;color:#272738;">Northern Rockies Regional Municipality website</span></a><span style="background-color:white;color:#272738;">.</span></li><li><span style="background-color:white;color:#272738;">The Northern Rockies Regional Municipality has upgraded the already existing Evacuation Alert to an Evacuation Order. More information on the Evacuation Order is available online at </span><a href="https://www.emergencyinfobc.gov.bc.ca/event/wildfire-nrrm-may9/"><span style="background-color:white;color:#272738;">EmergencyInfoBC</span></a><span style="background-color:white;color:#272738;"> and the </span><a href="https://www.northernrockies.ca/en/index.aspx"><span style="background-color:white;color:#272738;">Northern Rockies Regional Municipality website</span></a><span style="background-color:white;color:#272738;">&nbsp;</span></li></ul>',
    incidentSizeType: 'Mapped',
    contactOrgUnitIdentifer: 50,
    contactPhoneNumber: '250-951-4209',
    contactEmailAddress: 'BCWS.COFCInformationOfficer@gov.bc.ca',
    resourceDetail: null,
    wildfireCrewResourcesDetail: 'There are currently 4 Initial Attack and 4 Unit Crews responding to this wildfire.',
    wildfireAviationResourceDetail: 'There are currently 1 helicopters and 1 airtankers responding to this wildfire.',
    heavyEquipmentResourcesDetail: 'There are currently 1 pieces of heavy equipment responding to this wildfire.',
    incidentMgmtCrewRsrcDetail: 'An Incident Management Team has been assigned to this wildfire.',
    structureProtectionRsrcDetail: null,
    publishedUserTypeCode: null,
    publishedUserGuid: null,
    publishedUserUserId: null,
    publishedUserName: null,
    publishedIncidentRevisionCount: 116,
    createUser: 'SCL\\WFNEWS_SYNC',
    updateUser: 'SCL\\WFNEWS_SYNC',
    selfLink: 'http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident',
    quotedETag: '"471f04b0-c6e4-da9f-20be-895b9a064b30"',
    unquotedETag: '471f04b0-c6e4-da9f-20be-895b9a064b30',
    _type: null
};

const mockEvacOrders = [
  {
    eventName: 'Evacuation Order 1',
    eventType: 'Order',
    orderAlertStatus: 'Active',
    issuingAgency: 'Agency 1',
    issuedOn: '2023-04-01',
  }
];

const mockAreaRestrictions = [
  {
    name: 'Area Restriction 1',
    accessStatusEffectiveDate: '2023-04-01',
    fireCentre: 'Centre 1',
    fireZone: 'Zone 1',
  }
];

// Define the default export configuration using Meta
const meta: Meta<IncidentTabsComponent> = {
  title: 'Components/IncidentTabs',
  component: IncidentTabsComponent,
  decorators: [
    moduleMetadata({
      declarations: [
        IncidentTabsComponent,
        IncidentInfoPanelComponent,
        IncidentOverviewPanel,
        IncidentGalleryPanel,
        IncidentMapsPanel
      ],
      imports: [
        CommonModule,
        MatTabsModule,
        BrowserAnimationsModule
      ]
    }),
  ],
  tags: ['autodocs'],
};

export default meta;

// Define the type for Story Object
type Story = StoryObj<IncidentTabsComponent>;

// Story for the default view
export const example: Story = {
  args: {
    incident: mockIncident,
    evacOrders: mockEvacOrders,
    areaRestrictions: mockAreaRestrictions,
    showImageWarning: false,
    showMapsWarning: false,
  }
};
