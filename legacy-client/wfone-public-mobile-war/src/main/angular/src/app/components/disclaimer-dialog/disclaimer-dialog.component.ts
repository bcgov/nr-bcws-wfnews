
import {Component, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {CONSTANTS} from "../../utils";

@Component({
  selector: 'wfone-disclaimer-dialog',
  templateUrl: './disclaimer-dialog.component.html',
  styleUrls: ['./disclaimer-dialog.component.scss']
})
export class DisclaimerDialogComponent implements OnInit {

  isChecked: boolean;
  CONSTANTS = CONSTANTS;

  constructor( public dialogRef: MatDialogRef<DisclaimerDialogComponent>){
     this.isChecked = false;
  }

  ngOnInit() {
  }

  close(){
    if(this.isChecked) {
      localStorage.setItem('disclaimerSeen','true');
    }
    this.dialogRef.close();
  }

  toggleShow(){
    this.isChecked = !this.isChecked;
  }


}
