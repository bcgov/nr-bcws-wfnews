import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wf-admin-panel',
  templateUrl: './wf-admin-panel.component.html',
  styleUrls: ['./wf-admin-panel.component.scss']
})
export class WfAdminPanelComponent implements OnInit {

  public currentYearString;
  public currentDateTimeString;


  constructor() { }

  ngOnInit(): void {
    this.getCurrentYearString();

  }

  getCurrentYearString(){
    this.currentYearString = new Date().getFullYear().toString() + "/" + (new Date().getFullYear()+1).toString();
    const todaysDate: Date = new Date();
    const options: Intl.DateTimeFormatOptions = {
       day: "numeric", month: "long", year: "numeric",
       hour: "numeric", minute: "2-digit"
    };
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayString = weekdays[todaysDate.getDay()];
    const liveDateTime: string  = (todayString + " " + todaysDate.toLocaleDateString("en-US", options)).replace(" at ", " - ");
    this.currentDateTimeString = liveDateTime
  }

}
