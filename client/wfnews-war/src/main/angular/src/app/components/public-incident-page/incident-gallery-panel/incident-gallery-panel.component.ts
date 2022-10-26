import { Component, ChangeDetectionStrategy, Input, OnInit } from "@angular/core";

@Component({
  selector: 'incident-gallery-panel',
  templateUrl: './incident-gallery-panel.component.html',
  styleUrls: ['./incident-gallery-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentGalleryPanel implements OnInit {
  @Input() public incident;

  currentMediaType: string;
  mediaTypeOptions: string[] = ["All","Images","Videos"];
  imagesAndVideosStub: any[];

  ngOnInit() {
    this.loadPage();
  }

  loadPage() {
    this.imagesAndVideosStub = [
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnSMUVjNA_9dKxmNk3_ZQNOejzZtiix1EkkQ&usqp=CAU" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnSMUVjNA_9dKxmNk3_ZQNOejzZtiix1EkkQ&usqp=CAU" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"image", href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnSMUVjNA_9dKxmNk3_ZQNOejzZtiix1EkkQ&usqp=CAU" },
      {title:"Lorem Ipsum dolor sit amet", uploadedDate:"June 23, 2022", fileName: "Incident-V25425-image.jpg", type:"video", href: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnSMUVjNA_9dKxmNk3_ZQNOejzZtiix1EkkQ&usqp=CAU" },
    ];
  }
}
