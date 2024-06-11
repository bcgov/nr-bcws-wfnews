import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'wfnews-protected-land-preview',
  templateUrl: './protected-land-preview.component.html',
  styleUrls: ['./protected-land-preview.component.scss']
})
export class ProtectedLandPreviewComponent {
  public data;
  formatDate = formatDate;
  setContent(data) {
    this.data = data.properties;
  }
  

  closePanel() {  
    hidePanel('identify-panel-wrapper')
    showPanel('desktop-preview');
  }
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }
  
}
