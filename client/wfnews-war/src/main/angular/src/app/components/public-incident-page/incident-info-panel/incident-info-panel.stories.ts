import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { IncidentInfoPanelComponent } from './incident-info-panel.component';

// Mock data for the story
const mockIncident = {
    cacheExpiresMillis: null,
    publishedIncidentDetailGuid: 'a1cb0b30-982d-43f2-9168-57432a46a1c7',
    incidentGuid: 'FA58EFD1154B2322E0531D09228E354E',
    incidentNumberLabel: 'V65068',
    newsCreatedTimestamp: 1686956242000,
    stageOfControlCode: 'HOLDING',
    generalIncidentCauseCatId: 3,
    newsPublicationStatusCode: 'PUBLISHED',
    discoveryDate: 1682630442000,
    declaredOutDate: null,
    fireCentreCode: '50',
    fireCentreName: 'Coastal Fire Centre',
    fireOfNoteInd: true,
    wasFireOfNoteInd: true,
    incidentName: 'NOTIFICATION SHARON',
    incidentLocation: 'Near Juan De Fuca Park',
    traditionalTerritoryDetail: null,
    incidentSizeEstimatedHa: 43.222,
    incidentSizeMappedHa: 43.222,
    incidentSizeDetail: 'Fire size is based on most current information available. 232',
    // eslint-disable-next-line max-len
    incidentCauseDetail: 'Wildfire investigations often take time and can be very complex. Investigations may be carried out by one or more agencies, including the BC Wildfire Service, the Compliance and Enforcement Branch, the RCMP, or other law enforcement agencies, and may be cross jurisdictional.',
    wildfireCrewResourcesInd: true,
    wildfireAviationResourceInd: true,
    heavyEquipmentResourcesInd: true,
    incidentMgmtCrewRsrcInd: false,
    structureProtectionRsrcInd: false,
    crewResourceCount: null,
    aviationResourceCount: null,
    heavyEquipmentResourceCount: null,
    incidentManagementResourceCount: null,
    structureProtectionResourceCount: null,
    publishedTimestamp: 1715793217399,
    lastUpdatedTimestamp: 1715793217397,
    createDate: 1682630478374,
    updateDate: 1715793217402,
    latitude: '48.529335',
    longitude: '-124.448432',
    fireYear: 2023,
    responseTypeCode: null,
    responseTypeDetail: null,
    fireZoneUnitIdentifier: 54,
    // eslint-disable-next-line max-len
    incidentOverview: '<h4><strong>Wildfire Information</strong></h4><figure class="media"><oembed url="https://www.youtube.com/watch?v=8RdXzb0Itcw"></oembed></figure><p>A BC Wildfire Service Incident Management Team (IMT) continues to ensure a coordinated response for the Donnie Creek Complex, which is located approximately 158 km north of Fort St. John and 136 km southeast of Fort Nelson. <span style="background-color:rgb(255,255,255);color:rgb(0,0,0);">The Donnie Creek Complex consists of three wildfires: Donnie Creek (G80280), Klua Lakes (G90273), and Muskwa River (G90292).</span></p><p><strong>Fire Behaviour &amp; Weather:&nbsp;</strong></p><p style="margin-left:0cm;">Overnight Wednesday, skies will partially clear.&nbsp; Recoveries remain excellent with relative humidity approaching 90% or higher. Strong inversions will set up overnight Wednesday, helping to temporarily slow fire behaviour while smoke builds within the boundary layer. The pattern remains fairly unchanged through Thursday. The biggest change will be increased cloud cover potentially resulting in cooler temperatures. Small disturbances embedded in the northerly flow will support afternoon showers and thunderstorms with a chance of measurable rainfall. Crews will be watching for stronger, gustier northerly winds developing midday Thursday. There may be patches of fog Friday morning.</p><p style="margin-left:0cm;">Today is another drying day on the fire. Crews expect fire behaviour similar to yesterday’s albeit it potentially earlier in the day. There is a potential for precipitation later in the day, but it is not widespread. The warming and drying trend is expected to continue.</p><p>The fire danger rating for the North Peace is generally high-to-extreme. In current conditions, fuels will spread easily, burn vigorously, and challenge fire suppression efforts. Drought conditions persist in much of the Prince George Fire Centre.</p><p><img src="data:image/jpeg;base64,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"></p><p>&nbsp;</p><p><strong>Conditions:</strong><br><br>The Donnie Creek wildfire is now mapped at 553,947 hectares in size and remains Out of Control.&nbsp;</p><p>Because of the remote work location and hazards common to this vast boreal forest area, ensuring the safety and well-being of responders, industry and the public remain paramount.</p><p>Crews continue to work along the Alaska Highway and any impacts to this important transportation corridor will be reported on DriveBC. For the latest information, please check the <a href="https://drivebc.ca/">Drive BC website</a>.&nbsp;</p><p><strong>Complex Objectives:&nbsp;</strong></p><p><span style="color:windowtext;">There is very little change to crew objectives. Crews continue with their assignments joined yesterday by twenty firefighters from Alaska. Today an additional twenty American firefighters will arrive and be assigned as needed.&nbsp;</span></p><p><span style="color:windowtext;">Crews continue to mop up and demobilize equipment along the perimeter of the main body of the fire from the 202 Road near Trutch southward and along the finger to the north. Crews are dealing with a few spots that have been identified. The fire continues to be monitored on the northwest flank near Drymeat Lake with aerial support.&nbsp;</span></p><p style="margin-left:0cm;">On the south flank crews continue to work from the Beatton Creek heading east putting in machine guards and following with hose lay. &nbsp;Crews working north of Camp 192 reported good progress throughout most of the day but had to pull back from one area due to increased fire behaviour. Crews will tie into an old burn scar and look for an opportunity to conduct a planned ignition. Fuel mitigation is complete at the CN Bridge. Firefighters are also working at 27.5 km on Tommy Lakes Road putting in hose lay and assessing danger trees assessing and falling as necessary.&nbsp;</p><p style="margin-left:0cm;">Equipment is being used to remove trees (daylighting) along the Tommy Lakes Road from the 28-kilometre mark to 34.5 km.</p><p><span style="color:windowtext;">On the southeast flank crews noted an increase in fire behaviour yesterday from 10:30 continuing throughout the day. Crews today are working near Two Creeks Road. The fire along the Beatton River remained on the northwest side. Growth was experienced in two areas along the railway. Crews are looking at a secondary plan to mitigate any further growth.&nbsp;</span></p><p><span style="color:windowtext;">Advanced forward planning is ongoing to identify and address potential future impacts to structures, infrastructure and industry assets based on growth projections for the three fires that make up the Donnie Creek Complex. Forward planning work guides future operational priorities and actions.</span></p><p><a href="https://blog.gov.bc.ca/bcwildfire/area-restriction-in-effect-for-vicinity-of-donnie-creek-complex/"><span style="color:rgb(0,0,0);"><strong>Area Restriction</strong></span></a><span style="color:rgb(0,0,0);"><strong>:</strong></span></p><p><span style="background-color:rgb(255,255,255);color:rgb(0,0,0);">On</span><span style="color:rgb(0,0,0);"> June 8 an Are</span>a Restriction was put into place in the region surrounding the complex. This allows the BC Wildfire Service to control access into the area and help to keep members of the public out of this active firefighting area for their own safety and the safety of responders. For details click the link <a href="https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/wildfire-status/fire-bans-and-restrictions/prince-george-maps/23_g80280_map_arearestriction_public_85x11p_june08.jpg">https://www2.gov.bc.ca/assets/gov/public-safety-and-emergency-services/wildfire-status/fire-bans-and-restrictions/prince-george-maps/23_g80280_map_arearestriction_public_85x11p_june08.jpg</a></p><p>During the time when the Area Restriction is in place, the BC Wildfire Service will control access in and out of the area for the safety of the public and responders working the fire. To gain access to a location within the Area Restriction, a compelling reason must be given, and safe access and egress must be possible. A BCWS Liaison Officer is in place to consider access requests and can be contacted at: 778-362-4794 or by email at <a href="mailto:BCWS.DonnieCreekComplex.Liaison@gov.bc.ca">BCWS.DonnieCreekComplex.Liaison@gov.bc.ca</a>.</p><p><strong>Evacuation Alerts:</strong></p><p>The Peace River Regional District has lifted its evacuation order and issued evacuation alerts related to the Donnie Creek Wildfire. For up-to-date information regarding the alert, please visit their website <a href="https://prrd.bc.ca/category/emergency-evacuations/">here</a></p><p>The Northern Rockies Regional Municipality has lifted its Evacuation Alert for the area. For up-to-date information regarding the alert please visit their website<a href="https://www.northernrockies.ca/Modules/News/en?page=1"> here.</a></p>',
    incidentSizeType: 'Mapped',
    contactOrgUnitIdentifer: 50,
    contactPhoneNumber: '250-951-4209',
    contactEmailAddress: 'BCWS.COFCInformationOfficer@gov.bc.ca',
    resourceDetail: 'Here is the response',
    wildfireCrewResourcesDetail: 'There are currently 5 Initial Attack and 6 Unit Crews responding to this wildfire.',
    wildfireAviationResourceDetail: 'There are currently 6 helicopters and 6 airtankers responding to this wildfire.',
    heavyEquipmentResourcesDetail: 'There are currently 8 pieces of heavy equipment responding to this wildfire.',
    incidentMgmtCrewRsrcDetail: null,
    structureProtectionRsrcDetail: null,
    publishedUserTypeCode: null,
    publishedUserGuid: null,
    publishedUserUserId: null,
    publishedUserName: null,
    publishedIncidentRevisionCount: 48,
    createUser: 'SCL\\WFNEWS_SYNC',
    updateUser: 'SCL\\WFNEWS_SYNC',
    selfLink: 'http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident',
    quotedETag: '"7f54005e-f4de-23af-d7bd-2bbed28a808d"',
    unquotedETag: '7f54005e-f4de-23af-d7bd-2bbed28a808d',
    _type: null
};

const mockEvacOrders = [
  {
    orderAlertStatus: 'Order',
    issuedOn: '2023-05-01',
    issuingAgency: 'Agency Name',
    eventName: 'Evacuation Order Event',
  },
];

const mockEvacAlerts = [
  {
    orderAlertStatus: 'Alert',
    issuedOn: '2023-05-01',
    issuingAgency: 'Agency Name',
    eventName: 'Evacuation Alert Event',
    externalUri: '',
  },
];

const mockAreaRestrictions = [
  {
    name: 'Area Restriction Name',
    fireCentre: 'Fire Centre Name',
    accessStatusEffectiveDate: '2023-05-01',
  },
];

export default {
  title: 'Components/IncidentInfoPanel',
  component: IncidentInfoPanelComponent,
  decorators: [
    moduleMetadata({
      declarations: [IncidentInfoPanelComponent],
      imports: [CommonModule, MatIconModule, MatButtonModule],
    }),
  ],
} as Meta<IncidentInfoPanelComponent>;

type Story = StoryObj<IncidentInfoPanelComponent>;

export const example: Story = {
  args: {
    incident: mockIncident,
    evacOrders: mockEvacOrders,
  },
};

export const withoutEvacuations: Story = {
  args: {
    incident: {
      ...mockIncident,
      fireOfNoteInd: false,
    },
    evacOrders: [],
    areaRestrictions: [],
  },
};

export const withMultipleEvacuations: Story = {
  args: {
    incident: mockIncident,
    evacOrders: [
      ...mockEvacOrders,
      {
        orderAlertStatus: 'Order',
        issuedOn: '2023-05-02',
        issuingAgency: 'Another Agency Name',
        eventName: 'Another Evacuation Order Event',
      },
    ],
  },
};
