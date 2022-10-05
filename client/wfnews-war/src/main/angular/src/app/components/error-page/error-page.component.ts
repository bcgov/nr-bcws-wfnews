import {AfterViewInit, Component} from '@angular/core';
import { AppConfigService } from '@wf1/core-ui/public_api';
import {BaseComponent} from '../base/base.component';

@Component({
  selector: 'wfnews-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent extends BaseComponent implements AfterViewInit {
  appConfig: AppConfigService;
}
