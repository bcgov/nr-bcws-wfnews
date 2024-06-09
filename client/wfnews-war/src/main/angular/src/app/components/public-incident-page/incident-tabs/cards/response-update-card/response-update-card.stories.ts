import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ResponseUpdateCardComponent } from './response-update-card.component';

const meta: Meta<ResponseUpdateCardComponent> = {
  title: 'Cards/ResponseUpdateCard',
  component: ResponseUpdateCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [ResponseUpdateCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ResponseUpdateCardComponent>;

export const short: Story = {
  args: {
    updateDate: 'July 19,2024',
  },
  render: (args) => ({
    template: `
      <response-update-card updateDate="${args.updateDate}">
      For up-to-date information, please contact the Information Officer at 778-362-4783. Making this a bit longer to see if it will trigger the columns. Lorem ipsum dolor sit amet, consectetur adipiscing elit
      
      </response-update-card>
    `,
  }),
};

export const withSimpleHtml: Story = {
  args: {
    updateDate: 'July 20,2024',
  },
  render: (args) => ({
    template: `
      <response-update-card updateDate="${args.updateDate}">
      <figure class=\"image\"><img src=\"https://picsum.photos/1100/800\"></figure><p>G90207 is part of the North Peace Complex of fires, based in the community of Fort Nelson, BC.</p><p><span style=\"color:windowtext;\"><strong>Weather:</strong></span></p><p><span style=\"color:windowtext;\">While amounts vary (from .4 mm in some portions of the East to close to 40 mm in Fort Nelson), all fires in the complex did benefit from rain on Tuesday. Today will mark the beginning of a warming and drying trend, which will continue until at least the weekend, with Saturday being the warmest day.</span></p><p><span style=\"color:windowtext;\">Starting on Thursday, winds will increase to 15-25 km/hr gusting to 40 km/hr and this will likely persist until at least Friday.&nbsp;</span></p><p><span style=\"background-color:white;color:black;\"><strong>Fire Behaviour:</strong></span></p><p><span style=\"background-color:white;color:black;\">Fire behaviour is expected to be reduced to rank 1 and 2 today – a smoldering ground fire - thanks to yesterday’s rain and cooler temperatures. Amounts ranged from close to 40 mm around Fort Nelson to trace amounts on some of the Eastern fires in the complex.</span></p><p><span style=\"background-color:white;color:black;\">Areas of G90207 that received rain will continue to smolder in areas where the fire is dug in and burning deep under the ground. Rainfall amounts in these areas are not likely to have an extinguishing effect in areas where there is deep burning.</span></p><p><strong>Operations:&nbsp;</strong>&nbsp;</p><ul style=\"list-style-type:disc;\"><li>The Patry Creek wildfire does not pose an immediate threat to the community of Fort Nelson, although this fire may experience growth during sunny, dry and windy conditions.&nbsp;</li><li>Yesterday’s rain and cooler temperatures have reduced fire behaviour on this incident to mostly rank 1 and 2 – a smoldering ground fire.</li><li>Crews are continuing to progress on building containment along the Southeast corner of the fire, with the goal of preventing the fire from moving south.</li><li>Crews are continuing with direct attack operations along accessible portions along the south flank of the fire – the fire will continue to burn hot and deep under the ground, and this will continue to challenge ground crews as they progress along this flank.</li><li>There is a section of machine guard at the northmost area of the fire. This guard is intended to prevent further fire growth north towards highway 77.&nbsp;</li><li>Aerial resources are available to support ground crews on this incident.</li></ul><p><span style=\"color:hsl(0,0%,0%);\"><strong>Safety:</strong>&nbsp;</span></p><ul><li>The public are urged to obey signage and take extra care while driving near active worksites.</li><li><span style=\"color:hsl(0,0%,0%);\">Transport Canada and the BC Wildfire Service explicitly prohibit the use of publicly operated UAVs or drones of any size near a wildfire.&nbsp;</span></li><li><span style=\"color:hsl(0,0%,0%);\">All wildfires are automatically considered to be flight restricted, according to federal Canadian Aviation Regulations. The restricted area is within a radius of five nautical miles around the fire and to an altitude of 3,000 feet above ground level.</span></li><li><span style=\"color:hsl(0,0%,0%);\">The operation of any aircraft not associated with fire suppression activities within this area, including unmanned aerial vehicles (UAVs or drones), is illegal.</span></li><li><span style=\"color:hsl(0,0%,0%);\">Presence of drones near an active wildfire can slow down or completely shut down aerial firefighting efforts, due to safety concerns. This type of activity is extremely dangerous and poses a significant safety risk to personnel, especially when low-flying firefighting aircraft are present. If a UAV or drone collides with firefighting aircraft, the consequences could be deadly.&nbsp;</span></li></ul><p><strong>Evacuation Alerts and Orders/Highway Closures:</strong></p><ul style=\"list-style-type:disc;\"><li>The Northern Rockies Regional Municipality and Fort Nelson First Nation have issued an Evacuation Alert for the&nbsp;<span style=\"background-color:white;color:black;\">Town of Fort Nelson, Fort Nelson First Nation (IR #2 and IR #5), and the areas encompassing Highway 77 North, Highway 97 South, and 292 Subdivision.</span> More information is available at <a href=\"https://www.emergencyinfobc.gov.bc.ca/?post_type=event&amp;p=58942\">EmergencyInfoBC</a>.</li><li>The Northern Rockies Regional Municipality has issued a Prohibited Access Order exclusively for the 10 properties impacted by the wildfire. More information is available online at <a href=\"https://nr.civicweb.net/filepro/documents/214140/?preview=214227\">EmergencyInfoBC</a></li><li>Highway 97 (Alaska Highway) is open, with pilot cars activated between 301 km to 309 km. Highway 77 is open, speed is restricted with signage posted. More information can be found on&nbsp;<a href=\"https://drivebc.ca/\">DriveBC</a>.</li><li>The BC Wildfire Service has implemented an <a href=\"https://blog.gov.bc.ca/bcwildfire/updated-area-restriction-in-effect-for-northeast-wildfires/\">Area Restriction Order</a> for the vicinity of the Patry Creek (<a href=\"https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fe1.envoke.com%2Fext%2Fclick%2Fgo%2Fcd9c027cc919cff110a615ccfdf58a6b%2F6b4b84fad4a2aaed5e36641394e7c603%2Ffbea4bd8c9921c951692821604e1dadd&amp;data=05%7C02%7CFIREINFO%40gov.bc.ca%7Ca90ff51666054a2b8ed308dc72cd5717%7C6fdb52003d0d4a8ab036d3685e359adc%7C0%7C0%7C638511473451546001%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&amp;sdata=LZbAwfqAkky%2Bp88JBUO1W1JHYzt4O5TrbbTdAtQ0Fdk%3D&amp;reserved=0\">G90207</a>) and Nogah Creek (<a href=\"https://can01.safelinks.protection.outlook.com/?url=https%3A%2F%2Fe1.envoke.com%2Fext%2Fclick%2Fgo%2Fcd9c027cc919cff110a615ccfdf58a6b%2Fc906b9df191bafa0c896641394e7e644%2Ffbea4bd8c9921c951692821604e1dadd&amp;data=05%7C02%7CFIREINFO%40gov.bc.ca%7Ca90ff51666054a2b8ed308dc72cd5717%7C6fdb52003d0d4a8ab036d3685e359adc%7C0%7C0%7C638511473451553374%7CUnknown%7CTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7C0%7C%7C%7C&amp;sdata=iKlX3s151tijF05NweYoI3tX7NTmF3GP%2FbL2P1en8Ig%3D&amp;reserved=0\">G90228</a>) wildfires, located in the North Peace Complex. The size of the area restriction reflects the continued need to protect the public in areas where there are ongoing fire suppression activities and hazardous fire behaviour conditions.</li></ul>
      </response-update-card>
    `,
  }),
};
