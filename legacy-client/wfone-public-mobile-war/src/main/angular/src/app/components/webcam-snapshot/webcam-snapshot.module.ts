import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { WebcamSnapshotComponent } from "./webcam-snapshot.component";

@NgModule({
  imports: [CommonModule],
  declarations: [WebcamSnapshotComponent],
  exports: [WebcamSnapshotComponent]
})
export class WebcamSnapshotModule {}
