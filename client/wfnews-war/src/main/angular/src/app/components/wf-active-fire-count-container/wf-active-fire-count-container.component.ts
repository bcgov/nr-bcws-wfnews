import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConfigService } from '@wf1/core-ui';
@Component({
  selector: 'wf-active-fire-count-container',
  templateUrl: './wf-active-fire-count-container.component.html',
  styleUrls: [ './wf-active-fire-count-container.component.scss' ],
  
})
export class WFActiveFireCountContainerComponent implements OnInit, OnChanges { 

  @Input() incidents:any;

  activeFireCount: number;
  incidentsServiceUrl: string

  constructor(
    private http: HttpClient,
    private matIconRegistry: MatIconRegistry,
    private domSanitize: DomSanitizer,
    private appConfig: AppConfigService,
    ){
      this.incidentsServiceUrl = appConfig.getConfig().rest['newsLocal']
  }

  ngOnInit()  {
      this.getActiveFireCounts();

      this.matIconRegistry.addSvgIcon (
        'map-sign01',
        this.domSanitize.bypassSecurityTrustResourceUrl("assets/icons/map-signs.svg")
      )
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  getActiveFireCounts(){
    setTimeout(() => {
      let url = this.incidentsServiceUrl + '/incidents';
      let headers = new HttpHeaders();
      headers.append('Access-Control-Allow-Origin','*');
      headers.append('Accept','*/*');
      this.http.get<any>(url,{headers}).subscribe(response => {
        this.activeFireCount = response.collection.length;
      })
    },2000)
  }
}