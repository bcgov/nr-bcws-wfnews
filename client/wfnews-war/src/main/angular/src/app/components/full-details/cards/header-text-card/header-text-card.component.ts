import { Component, Input } from '@angular/core';

@Component({
  selector: 'header-text-card',
  templateUrl: './header-text-card.component.html',
  styleUrls: ['./header-text-card.component.scss']
})
export class HeaderTextCardComponent {

  @Input() title: string;
}
