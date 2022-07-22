import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TokenService } from "@wf1/core-ui";
import { IncidentsContainer } from "../../containers/incidents/incidents-container.component";
import { RootState } from "../../store";
import { getIncidents } from "../../store/incidents/incidents.actions";

@Component({
  selector: 'wf-active-fire-count-container',
  templateUrl: './wf-active-fire-count-container.component.html',
  styleUrls: [ './wf-active-fire-count-container.component.scss' ],
})
export class WFActiveFireCountContainerComponent extends IncidentsContainer implements OnInit, OnChanges { 
  ngOnInit()  {
    setTimeout(() => {
      this.store.dispatch(getIncidents('test'))
    },2000)
    //this.store.dispatch(getIncidents('test'))

  }

  ngOnChanges(changes: SimpleChanges) {
      console.log('sa')
  }
}