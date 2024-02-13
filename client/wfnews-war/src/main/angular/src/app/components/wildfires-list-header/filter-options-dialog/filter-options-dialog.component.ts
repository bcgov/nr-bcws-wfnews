import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class FilterData {
  public sortDirection = 'DESC';
  public sortColumn = 'lastUpdatedTimestamp';
  public stagesOfControl: string[] = ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL'];
  public fireOfNoteInd = null;
  public fireCentre: number;
}

@Component({
  selector: 'filter-options-dialog',
  templateUrl: 'filter-options-dialog.component.html',
  styleUrls: ['./filter-options-dialog.component.scss'],
})
export class FilterOptionsDialogComponent {
  public filterData: FilterData;

  constructor(
    private dialogRef: MatDialogRef<FilterOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FilterData,
  ) {
    this.filterData = data || new FilterData();
  }

  setSortDirection(sortDirection: string) {
    this.filterData.sortDirection = sortDirection;
  }

  setSortColumn(sortColumn: string) {
    this.filterData.sortColumn = sortColumn;
  }

  setFireOfNoteInd() {
    // show fires that are not fire of note when this filter is unselected
    if (this.filterData.fireOfNoteInd) this.filterData.fireOfNoteInd = null;
    else this.filterData.fireOfNoteInd = true;
  }

  setFireCentre(fireCentre: number) {
    if (this.filterData.fireCentre === fireCentre) {
      this.filterData.fireCentre = undefined ;
      } else {
        this.filterData.fireCentre = fireCentre;
      }
  }

  setStageOfControl(soc: string) {
    if (this.filterData.stagesOfControl.includes(soc)) {
this.removeStageOfControl(soc);
} else {
this.addStageOfControl(soc);
}
  }

  addStageOfControl(soc: string) {
    this.filterData.stagesOfControl.push(soc);
  }

  removeStageOfControl(soc: string) {
    const index = this.filterData.stagesOfControl.indexOf(soc);
    if (index > -1) {
      this.filterData.stagesOfControl.splice(index, 1);
    }
  }
}
