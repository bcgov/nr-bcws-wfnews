import { AfterViewInit, Component } from '@angular/core';
import { AppConfigService } from '@wf1/core-ui';

export interface BlogCard {
  title: string;
  icon: string;
  iconClass?: string;
  link: string;
  description?: string;
  height?: number;
  width?: number;
  useMask?: boolean;
}

@Component({
  selector: 'blog-widget',
  templateUrl: './blog-widget.component.html',
  styleUrls: ['./blog-widget.component.scss'],
})
export class BlogWidget implements AfterViewInit {
  public startupComplete = false;

  public blogCards: BlogCard[] = [
    {
      title: 'BC Wildfire Blog',
      icon: '/assets/images/svg-icons/bc-logo.svg',
      iconClass: 'blog-card-header-icon',
      link: 'https://blog.gov.bc.ca/bcwildfire/',
      description: 'Explore publicly issued bulletins, updates on wildfire activity across B.C. and other wildfire information.',
      height: 55,
      width: 59,
    },
    {
      title: 'Facebook',
      icon: '/assets/images/svg-icons/facebook-blue.svg',
      iconClass: 'blog-card-header-icon-blue',
      link: 'https://www.facebook.com/BCForestFireInfo/'
    },
    {
      title: 'Youtube',
      icon: '/assets/images/svg-icons/youtube.svg',
      iconClass: 'blog-card-header-icon-blue',
      link: 'https://www.youtube.com/@BCWildfireService'
    },
    {
      title: 'App FAQs',
      link: this.appConfigService.getConfig().externalAppConfig['faqUrl'].toString(),
      icon: '/assets/images/svg-icons/question.svg',
      iconClass: 'question-icon',
      useMask: true,
    }
  ];

  public linkIcon = '/assets/images/svg-icons/link.svg';

  constructor(private appConfigService: AppConfigService) {}

  ngAfterViewInit(): void {
    this.startupComplete = true;
  }

  openLink(url: string): void {
    window.open(url, '_blank');
  }
}
