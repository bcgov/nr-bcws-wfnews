import {AfterViewInit, Component} from "@angular/core";
import { AppConfigService } from "@wf1/core-ui/public_api";
import {BaseComponent} from "../base/base.component";

@Component({
  selector: 'wfnews-sign-out-page',
  templateUrl: './sign-out-page.component.html',
  styleUrls: ['./sign-out-page.component.scss']
})
export class SignOutPageComponent extends BaseComponent implements AfterViewInit {
  appConfig: AppConfigService

  ngOnInit() {

    this.tokenService.clearLocalStorageToken()
    const siteminderUrlPrefix = this.appConfigService.getConfig().application['siteminderUrlPrefix'].toString();
    const baseUrl = this.appConfigService.getConfig().application.baseUrl
    window.location.href = siteminderUrlPrefix + baseUrl + "&retnow=1";
    
  }

  ngOnDestroy() {
    // unused
  }

}