import { Component } from '@angular/core';
import { formatDate, hidePanel, showPanel } from '@app/utils';

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
    hidePanel('desktop-preview');
  }
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
  }
  
}
