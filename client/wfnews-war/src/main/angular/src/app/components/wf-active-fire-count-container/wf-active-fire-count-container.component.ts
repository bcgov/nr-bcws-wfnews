import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TokenService } from "@wf1/core-ui";
import { RootState } from "../../store";
import { getIncidents } from "../../store/incidents/incidents.actions";

@Component({
  selector: 'wf-active-fire-count-container',
  templateUrl: './wf-active-fire-count-container.component.html',
  styleUrls: [ './wf-active-fire-count-container.component.scss' ],
})
export class WFActiveFireCountContainerComponent implements OnInit, OnChanges { 

  @Input() incidents:any;

  activeFireCount: number;

  constructor(private http: HttpClient){

  }

  ngOnInit()  {
      this.getActiveFireCounts();
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  getActiveFireCounts(){
    setTimeout(() => {
      let url = `http://localhost:8080/wfnews-api-rest-endpoints-1.0.0-SNAPSHOT/incidents`;
      let headers = new HttpHeaders();
      headers.append('Access-Control-Allow-Origin','*');
      headers.append('Accept','*/*');
      this.http.get<any>(url,{headers}).subscribe(response => {
        console.log(response)
        this.activeFireCount = response.collection.length;
      })
    },2000)
  }
}