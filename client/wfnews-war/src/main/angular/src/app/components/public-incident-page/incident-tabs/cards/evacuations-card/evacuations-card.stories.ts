import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { EventInfoComponent } from '@app/components/common/event-info/event-info.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CircleIconButtonComponent } from '../../../../common/circle-icon-button/circle-icon-button.component';
import { EvacuationsCardComponent } from './evacuations-card.component';

const meta: Meta<EvacuationsCardComponent> = {
  title: 'Cards/EvacuationsCard',
  component: EvacuationsCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        EvacuationsCardComponent,
        ContentCardContainerComponent, 
        EventInfoComponent, 
        CircleIconButtonComponent, 
        IconListItemComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<EvacuationsCardComponent>;

export const example: Story = {
  args: {
    evacuations: [
      {
        eventName: 'Crater Creek Wildfire',
        eventType: 'Wildfire',
        orderAlertStatus: 'Alert',
        issuingAgency: 'Lower Similkameen Indian Band',
        preOcCode: 'CTL',
        emrgOAAsysID: 4,
        uri: null,
        issuedOn: 'August 19, 2023 at 10:55 a.m. PST',
        eventNumber: 'K55405'
      }, {
        eventName: 'Manual Order',
        eventType: 'Order',
        orderAlertStatus: 'Order',
        issuingAgency: 'Pending',
        preOcCode: 'NA',
        emrgOAAsysID: 0,
        uri: 'http://google.com',
        centroid: [
          0,
          0
        ],
        issuedOn: 'February 28, 2024',
        externalUri: true
      }, {
        eventName: 'Crater Creek Wildfire',
        eventType: 'Wildfire',
        orderAlertStatus: 'Alert',
        issuingAgency: 'Lower Similkameen Indian Band',
        preOcCode: 'CTL',
        emrgOAAsysID: 4,
        uri: null,
        issuedOn: 'August 19, 2023 at 10:55 a.m. PST',
        eventNumber: 'K55405'
      }, {
        eventName: 'Manual Order',
        eventType: 'Order',
        orderAlertStatus: 'Order',
        issuingAgency: 'Pending',
        preOcCode: 'NA',
        emrgOAAsysID: 0,
        uri: 'http://google.com',
        centroid: [
          0,
          0
        ],
        issuedOn: 'February 28, 2024',
        externalUri: true
      }
    ],
    incident: {
      cacheExpiresMillis: null,
      links: [
        {
          rel: 'self',
          href: 'http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident',
          method: 'GET',
          _type: null
        }
      ],
      publishedIncidentDetailGuid: '9592dafb-a0ab-4d03-ab96-3ce09781a111',
      incidentGuid: '09D708BA43CE5FCDE0631D09228EE762',
      incidentNumberLabel: 'K55405',
      newsCreatedTimestamp: 1701721239000,
      stageOfControlCode: 'HOLDING',
      generalIncidentCauseCatId: 3,
      newsPublicationStatusCode: 'PUBLISHED',
      discoveryDate: 'November 10, 2023',
      declaredOutDate: 'Pending',
      fireCentreCode: '25',
      fireCentreName: 'Kamloops Fire Centre',
      fireOfNoteInd: true,
      wasFireOfNoteInd: true,
      incidentName: 'Crater Cr',
      incidentLocation: 'Near Crater Creek',
      traditionalTerritoryDetail: 'Crater Creek First Nation - Test',
      incidentSizeEstimatedHa: '100',
      incidentSizeMappedHa: 100,
      incidentSizeDetail: 'Fire size is based on the last known estimated size in hectares.',
      incidentCauseDetail: 'Humans start wildfires in several ways, either by accident or intentionally.',
      wildfireCrewResourcesInd: true,
      wildfireAviationResourceInd: true,
      heavyEquipmentResourcesInd: true,
      incidentMgmtCrewRsrcInd: false,
      structureProtectionRsrcInd: true,
      crewResourceCount: 8,
      aviationResourceCount: 2,
      heavyEquipmentResourceCount: null,
      incidentManagementResourceCount: 3,
      structureProtectionResourceCount: null,
      publishedTimestamp: 1718607610114,
      lastUpdatedTimestamp: 'June 17, 2024',
      createDate: 1701721239000,
      updateDate: 'June 17, 2024 at 12:00 a.m. PST',
      latitude: '49.223833',
      longitude: '-119.924783',
      fireYear: 2023,
      responseTypeCode: 'FULL',
      responseTypeDetail: null,
      fireZoneUnitIdentifier: 30,
      // eslint-disable-next-line max-len
      incidentOverview: '<p><span style="background-color:white;color:black;"><strong>Operations:</strong></span></p><ul style="list-style-type:disc;"><li>The fire’s active area is burning rank 1 and 2. Long term drought conditions support deep burning underneath the forest floor.</li><li>Crews are working all areas of the fire’s edge, mopping up and using thermal scan results to target areas of heat.</li><li>Danger tree assessment and falling continue along areas of the fire perimeter.</li><li>Aviation resources continue to support ground crews with buckets, cooling areas of increased fire behaviour ahead of established mop-up operations.</li><li>Watch this video: &nbsp;</li></ul><figure class="media"><oembed url="https://www.youtube.com/watch?v=5hghT1W33cY"></oembed></figure><p><span style="color:windowtext;"><strong>Weather:</strong></span></p><p><span style="color:black;">Today we expect continued winds from the northwest with speeds of 20-30 gusting to 50 km/h. Min RH is forecast at 17% and temperature 21C. On Thursday night, there is a chance of showers and isolated thunderstorms, which would increase the humidity. Confidence in this is low. Long term models are beginning to support an upper ridge building over B.C. next week, which would bring hotter and drier conditions.</span></p><p><strong>Fire Behaviour:</strong></p><p><span style="background-color:white;color:black;">It was an active day on all fires in the complex yesterday, with remote areas that have not received suppression efforts putting up a significant amount of smoke. Surface fuels have dried since the precipitation on May 26 and 27. We observed intermittent crowning yesterday and expect the same today. In dense stands of boreal spruce, today’s wind may lead to continuous crown fire.</span></p><p><strong>Resources</strong>:</p><ul style="list-style-type:disc;"><li>An Incident Management Team is on site managing the North Peace Complex and has operational command of this wildfire.</li><li>BC Wildfire Service resources are working with The Northern Rockies Municipal Fire Department and emergency services staff.</li><li>186 firefighters are responding to this complex and 26 Initial Attack personnel are available for response for new starts in the zone but will be utilized on existing incidents as needed.&nbsp;</li><li>6 Danger Tree Fallers are assigned to the North Peace Complex.</li><li>19 helicopters and 1 fixed wing aircraft are assigned to the North Peace Complex with airtankers available as required for operational objectives.</li><li>11 pieces of heavy equipment are assigned to the North Peace Complex.</li></ul><p><span style="color:hsl(0,0%,0%);"><strong>Safety:</strong>&nbsp;</span></p><ul><li>Crew operations will continue along roadsides, particularly along highway 97 near Fort Nelson. Public are urged to obey signage and take extra care while driving near active worksites.</li><li><span style="color:hsl(0,0%,0%);">Transport Canada and the BC Wildfire Service explicitly prohibit the use of publicly operated UAVs or drones of any size near a wildfire.&nbsp;</span></li><li><span style="color:hsl(0,0%,0%);">All wildfires are automatically considered to be flight restricted, according to federal Canadian Aviation Regulations. The restricted area is within a radius of five nautical miles around the fire and to an altitude of 3,000 feet above ground level.</span></li><li><span style="color:hsl(0,0%,0%);">The operation of any aircraft not associated with fire suppression activities within this area, including unmanned aerial vehicles (UAVs or drones), is illegal.</span></li><li><span style="color:hsl(0,0%,0%);">Presence of drones near an active wildfire can slow down or completely shut down aerial firefighting efforts, due to safety concerns. This type of activity is extremely dangerous and poses a significant safety risk to personnel, especially when low-flying firefighting aircraft are present. If a UAV or drone collides with firefighting aircraft, the consequences could be deadly.&nbsp;</span></li></ul><p><strong>Evacuation Alerts and Orders/Highway Closures:</strong></p><ul style="list-style-type:disc;"><li>The Northern Rockies Regional Municipality and Fort Nelson First Nation have issued an Evacuation Alert for the&nbsp;<span style="background-color:white;color:black;">Town of Fort Nelson, Fort Nelson First Nation (IR #2 and IR #5), and the areas encompassing Highway 77 North, Highway 97 South, and 292 Subdivision.</span> More information is available at <a href="https://www.emergencyinfobc.gov.bc.ca/?post_type=event&amp;p=58942">EmergencyInfoBC</a>.</li><li>The Northern Rockies Regional Municipality has issued a Prohibited Access Order exclusively for the 10 properties impacted by the wildfire. More information is available online at <a href="https://nr.civicweb.net/filepro/documents/214140/?preview=214227">EmergencyInfoBC</a></li><li>Highway 97 (Alaska Highway) is open, with pilot cars activated between 301 km to 309 km. Highway 77 is open, speed is restricted with signage posted. More information can be found on&nbsp;<a href="https://drivebc.ca/">DriveBC</a>.</li><li>The BC Wildfire Service has implemented an <a href="https://blog.gov.bc.ca/bcwildfire/updated-area-restriction-in-effect-for-northeast-wildfires/">Area Restriction Order</a> for the vicinity of the Patry Creek (<a href="https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fe1.envoke.com%2Fext%2Fclick%2Fgo%2Fcd9c027cc919cff110a615ccfdf58a6b%2F6b4b84fad4a2aaed5e36641394e7c603%2Ffbea4bd8c9921c951692821604e1dadd&amp;data=05%7C02%7CFIREINFO%40gov.bc.ca%7Ca90ff51666054a2b8ed308dc72cd5717%7C6fdb52003d0d4a8ab036d3685e359adc%7C0%7C0%7C638511473451546001%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&amp;sdata=LZbAwfqAkky%2Bp88JBUO1W1JHYzt4O5TrbbTdAtQ0Fdk%3D&amp;reserved=0">G90207</a>) and Nogah Creek (<a href="https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fe1.envoke.com%2Fext%2Fclick%2Fgo%2Fcd9c027cc919cff110a615ccfdf58a6b%2Fc906b9df191bafa0c896641394e7e644%2Ffbea4bd8c9921c951692821604e1dadd&amp;data=05%7C02%7CFIREINFO%40gov.bc.ca%7Ca90ff51666054a2b8ed308dc72cd5717%7C6fdb52003d0d4a8ab036d3685e359adc%7C0%7C0%7C638511473451553374%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&amp;sdata=iKlX3s151tijF05NweYoI3tX7NTmF3GP%2FbL2P1en8Ig%3D&amp;reserved=0">G90228</a>) wildfires, located in the North Peace Complex. The size of the area restriction reflects the continued need to protect the public in areas where there are ongoing fire suppression activities and hazardous fire behaviour conditions.</li></ul>',
      incidentSizeType: 'Estimated',
      contactOrgUnitIdentifer: 25,
      contactPhoneNumber: '250-554-5965',
      contactEmailAddress: 'KFCINFO@gov.bc.ca',
      resourceDetail: 'The BCWS  is assisting the Crater Creek First Nation with this wildfire response effort.',
      wildfireCrewResourcesDetail: 'There are currently 5 Initial Attack and 3 Unit Crews responding to this wildfire.',
      wildfireAviationResourceDetail: 'There are currently 1 helicopters and 0 airtankers responding to this wildfire.',
      heavyEquipmentResourcesDetail: 'There are currently 2 pieces of heavy equipment responding to this wildfire.',
      incidentMgmtCrewRsrcDetail: null,
      structureProtectionRsrcDetail: 'Structure protection is responding to this incident.',
      publishedUserTypeCode: null,
      publishedUserGuid: null,
      publishedUserUserId: null,
      publishedUserName: null,
      publishedIncidentRevisionCount: 140,
      createUser: 'SCL\\WFNEWS_SYNC',
      updateUser: 'SCL\\WFNEWS_SYNC',
      selfLink: 'http://wfnews-server.pp93w9-dev.nimbus.cloud.gov.bc.ca/publishedIncident',
      quotedETag: '"d21e7507-6f25-fa0a-9d37-39f9aee2bdcc"',
      unquotedETag: 'd21e7507-6f25-fa0a-9d37-39f9aee2bdcc',
      _type: null,
      geometry: {
        x: '-119.924783',
        y: '49.223833'
      }
    }
  }
};

export const emptyState: Story = {

};
