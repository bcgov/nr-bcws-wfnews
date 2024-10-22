import { Component } from '@angular/core';

@Component({  
  selector: 'when-you-leave-card',
  templateUrl: './when-you-leave-card.component.html',
  styleUrls: ['./when-you-leave-card.component.scss']
})
export class WhenYouLeaveCardComponent {

  warningStyle = {
    backgroundColor: '#FEF1F2',
    labelColor: '#242424',
    iconColor: '#D8292F',
    border: '1.5px solid #D8292F'
  };
}
