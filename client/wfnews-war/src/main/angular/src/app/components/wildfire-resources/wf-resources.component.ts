import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '@wf1/core-ui';
import { ResourcePanel } from '../../models/ResourcePanel';
import { isMobileView, snowPlowHelper } from '../../utils';

@Component({
  selector: 'wf-resources',
  templateUrl: './wf-resources.component.html',
  styleUrls: ['./wf-resources.component.scss'],
})
export class WildfirewResourcesComponent implements OnInit, AfterViewInit {
  public url;
  public snowPlowHelper = snowPlowHelper;

  isMobileView = isMobileView;

  constructor(
    protected appConfigService: AppConfigService,
    protected router: Router,
  ) {}
  ngOnInit(): void {
    this.url =
      this.appConfigService.getConfig().application.baseUrl.toString() +
      this.router.url.slice(1);
    this.snowPlowHelper(this.url);
  }

  ngAfterViewInit() {
    (window as any).snowplow('refreshLinkClickTracking');
  }

  // This can be moved into a config, for easier changes later
  public resourcePanels: ResourcePanel[] = [
    {
      title: 'Emergencies and Alerts',
      resources: [
        {
          title: 'Alerts and bulletins',
          subtitle: 'EmergencyInfoBC',
          url: 'https://www.emergencyinfobc.gov.bc.ca/',
          description:
          'Official response and recovery resources and verified event information.'
        },
        {
          title: 'Road closures and conditions',
          subtitle: 'DriveBC',
          url: 'https://drivebc.ca/#mapView&ll=54.004539%2C-123.75&z=6&xtg=Map%20Badge',
          description:
            'Current highway conditions for route planning.',
        },
        {
          title: 'Public weather alerts',
          subtitle: 'Environment Canada',
          url: 'https://weather.gc.ca/mainmenu/alert_menu_e.html',
          description:
            'Weather alerts and weather summaries.',
        },
        {
          title: 'Reporting wildfires',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels/report-a-wildfire',
          description:
            'Outlines details emergency call takers may ask during a report of wildfire. To report a fire call 1 800 663 5555 or *5555 on a cellphone.',
        },
        {
          title: 'Air Quality Health Index',
          subtitle: 'BC Ministry of Environment',
          url: 'https://www.env.gov.bc.ca/epd/bcairquality/readings/find-stations-map.html',
          description:
            'Map of the latest air quality health index information. Data is refreshed hourly.',
        },
        {
          title: 'Local government maps',
          subtitle: 'Government of British Columbia',
          url: 'https://www2.gov.bc.ca/gov/content/governments/local-governments/facts-framework/local-government-maps',
          description:
            'Map of local governments including regional districts, electoral areas and municipalities.',
        },
      ],
    },
    {
      title: 'Preparedness and Prevention',
      resources: [
        {
          title: 'Wildfire Prevention',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention',
          description:
            'Wildfire prevention at home, in the backcountry, and through larger-scale fire and fuel management planning.',
        },
        {
          title: 'Get Prepared for a Wildfire',
          subtitle: 'Prepared BC',
          url: 'https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/know-your-hazards/wildfires',
          description:
            'Overview of what to do before, during and after a wildfire, and a downloadable PFD of the Wildfire Preparedness Guide.',
        },
        {
          title: 'FireSmart BC',
          subtitle: 'FireSmart BC',
          url: 'https://firesmartbc.ca/',
          description:
            'FireSmart is a shared responsibility. Find out what you can do to decrease the wildfire risk at home and in your community.',
        },
        {
          title: 'Plan, Prepare, Stay Informed',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/plan-prepare-stay-informed',
          description:
            'Outline of how to prepare for evacuation if you live in an area prone to wildfire.'
        },
        {
          title: 'Fire Danger Rating',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-situation/fire-danger',
          description:
            'Fire danger rating in your area and other information about fire weather.',
        },
        {
          title: 'Fire Bans and Restrictions',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/fire-bans-and-restrictions',
          description:
            'Fire prohibitions and restrictions in British Columbia. These are made by B.C.’s six regional fire centres.'
        },
      ],
    },
    {
      title: 'More Information',
      resources: [
        {
          title: 'BC Wildfire Service Contact Channels',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/contact-channels',
          description:
            'A variety of BC Wildfire Service contact channels here.',
        },
        {
          title: 'Wildfire Blog',
          subtitle: 'BC Wildfire Service',
          url: 'https://blog.gov.bc.ca/bcwildfire/',
          description:
            'Read information bulletins, seasonal outlooks, wildfire status updates and wildfire stories on this site.',
        },
        {
          title: 'Wildfire Response',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response',
          description:
            'The BC Wildfire Service is a leader in wildfire management, known for skilled personnel and a focus on safety. Learn more about wildfires in B.C. and the BC Wildfire Service here.'
        },
        {
          title: 'Wildfire Statistics',
          subtitle: 'BC Wildfire Service',
          url: this.appConfigService.getConfig().application.baseUrl.toString() + 'dashboard',
          description:
            'The BC Wildfire Service compiles statistics daily, throughout the fire season. View the latest wildfire statistics in B.C. here.',
        },
        {
          title: 'Fire Centres',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/fire-centres',
          description:
            'The BC Wildfire Service has divided the province into six regional fire centres. These are further divided in fire zones. Read more here.',
        },
        {
          title: 'Wildfire Glossary',
          subtitle: 'BC Wildfire Service',
          url: 'https://www2.gov.bc.ca/gov/content/safety/wildfire-status/about-bcws/glossary',
          description:
            'Review terms commonly used to describe wildfire and fuel management here.',
        },
      ],
    },
  ];
}
