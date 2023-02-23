import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '@wf1/core-ui';
import { ResourcePanel } from '../../models/ResourcePanel';
import { snowPlowHelper } from '../../utils';

@Component({
  selector: 'wf-resources',
  templateUrl: './wf-resources.component.html',
  styleUrls: [ './wf-resources.component.scss' ]
})
export class WildfirewResourcesComponent implements OnInit, AfterViewInit{
  public url;
  public snowPlowHelper = snowPlowHelper

  constructor(protected appConfigService: AppConfigService,
    protected router: Router) {
}
ngOnInit(): void {
  this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
  this.snowPlowHelper(this.url)
}

ngAfterViewInit () {
  (window as any).snowplow('refreshLinkClickTracking')
}

  // This can be moved into a config, for easier changes later
  public resourcePanels: ResourcePanel[] = [
    {
      title: 'Emergencies and Alerts',
      resources: [
        {
          title: 'Alerts and Bulletins', subtitle: 'EmergencyInfoBC', url: 'https://www.emergencyinfobc.gov.bc.ca/latest-news/',
          description: 'EmergencyInfoBC is active during partial and full-scale provincial emergencies. This site shares official response and recovery resources, as well as verified event information from trusted partners.'
        },
        {
          title: 'Road Closures and Conditions', subtitle: 'DriveBC', url: 'https://drivebc.ca/#mapView&ll=54.004539%2C-123.75&z=6&xtg=Map%20Badge',
          description: 'DriveBC is managed by the B.C. Ministry of Transportation and Infrastructure. Travellers in B.C. can find information on current highway conditions before they leave. '
        },
        {
          title: 'Public Weather Alerts', subtitle: 'Environment Canada', url: 'https://www.weather.gc.ca/warnings/index_e.html',
          description: 'Get current weather alerts across Canada from Environment Canada. Read about the latest events in weather summaries. '
        },
        {
          title: 'Report a Wildfire', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels/report-a-wildfire',
          description: 'To report a wildfire, please call 1 800 663 5555 or *5555 on a cellphone. Learn more about the details emergency call takers may ask for when you are reporting a wildfire.'
        },
        {
          title: 'Air Quality Health Index', subtitle: 'BC Air Quality', url: 'https://www.env.gov.bc.ca/epd/bcairquality/readings/find-stations-map.html',
          description: 'View the latest air quality health index data on a map. Data is refreshed every 60 minutes.'
        },
        {
          title: 'Local Government Maps', subtitle: 'gov.bc.ca', url: 'https://www2.gov.bc.ca/gov/content/governments/local-governments/facts-framework/local-government-maps',
          description: 'Keep up to date on evacuation orders and alerts by following your local government, First Nation and emergency services. Find the boundaries for regional districts, electoral areas and municipalities here.'
        }
      ]
    }, {
      title: 'Preparedness and Prevention',
      resources: [
        {
          title: 'Wildfire Prevention', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention',
          description: 'Wildfire prevention can happen at home, in the backcountry, and through larger-scale fire and fuel management planning. Learn what you can do to help.'
        },
        {
          title: 'Get Prepared for a Wildfire', subtitle: 'Prepared BC', url: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/wildfires',
          description: 'If you live in an area at risk of a wildfire, it’s important that you take time to get ready. Understand what to do before, during and after a wildfire here.'
        },
        {
          title: 'FireSmart BC', subtitle: 'FireSmart BC', url: 'https://firesmartbc.ca/',
          description: 'FireSmart is a shared responsibility. Find out what you can do to decrease the wildfire risk at home and in your community.'
        },
        {
          title: 'Plan, Prepare, Stay Informed', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/plan-prepare-stay-informed',
          description: 'B.C. experiences 1,600 wildfires per year, on average. While most of these fires are put out before they threaten people and communities, it is important to be prepared especially if you live in an area prone to wildfire.'
        },
        {
          title: 'Fire Danger Rating', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation/fire-danger',
          description: 'Find out the current fire danger rating (i.e. the risk of a wildfire starting) in your area and other information about fire weather.'
        },
        {
          title: 'Fire Bans and Restrictions', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions',
          description: 'Decisions on when and where to implement fire bans and restrictions are made by B.C.’s six regional fire centres. Learn about fire bans and restrictions in your area.'
        }
      ]
    }, {
      title: 'More Information',
      resources: [
        {
          title: 'Wildfire Contact Channels', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels',
          description: 'Find the best way to connect with the BC Wildfire Service here. '
        },
        {
          title: 'Wildfire News Blog', subtitle: 'BC Wildfire Service', url: 'https://blog.gov.bc.ca/bcwildfire/',
          description: 'Read information bulletins, seasonal outlooks, wildfire status updates and wildfire stories on this site.'
        },
        {
          title: 'Wildfire Response', subtitle: 'BC Wildfire Service', url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response',
          description: 'The BC Wildfire Service is a leader in wildfire management, known for skilled personnel and a focus on safety. Learn more about wildfires in B.C. and the BC Wildfire Service here. '
        },
        {
          title: 'Wildfire Statistics', subtitle: 'BC Wildfire Service', url: 'https://bcfireinfo.for.gov.bc.ca/hprScripts/WildfireNews/Statistics.asp',
          description: 'The BC Wildfire Service compiles statistics daily, throughout the fire season. View the latest wildfire statistics in B.C. here.'
        },
        {
          title: 'Fire Centres',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/fire-centres',
          description: 'The BC Wildfire Service has divided the province into six regional fire centres. These are further divided in fire zones. Read more here.'
        },
        {
          title: 'Wildfire Glossary',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/glossary',
          description: 'Review terms commonly used to describe wildfire and fuel management here.'
        }
      ]
    }
  ]
}
