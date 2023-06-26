import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AppConfigService } from "@wf1/core-ui";
import { PublishedIncidentService } from "../../../../services/published-incident-service";
import { ActivatedRoute } from "@angular/router";
import { convertToMobileFormat, convertToYoutubeId } from "../../../../utils"

@Component({
  selector: 'incident-gallery-videos-mobile',
  templateUrl: './incident-gallery-videos-mobile.component.html',
  styleUrls: ['./incident-gallery-videos-mobile.component.scss']
})
export class IncidentGalleryVideosMobileComponent implements OnInit {
  @Input() public incident;
  incidentName: string  
  allVideosStub: any[];
  displayVideosStub: any[];
  displayLoadMore;
  public constructor(private publishedIncidentService: PublishedIncidentService, private appConfigService: AppConfigService, private cdr: ChangeDetectorRef,
    private router: ActivatedRoute) { }

  convertToMobileFormat = convertToMobileFormat
  convertToYoutubeId = convertToYoutubeId

  ngOnInit(): void {
    this.loadPage();
  }

  get videos () {
    return this.displayVideosStub
  }

  loadPage() {
    this.incidentName = this.incident.incidentName
    this.allVideosStub = []
    // fetch the Videos
    this.publishedIncidentService.fetchExternalUri(this.incident.incidentNumberLabel).toPromise().then(results => {
      if (results?.collection && results.collection.length > 0) {
          this.pushUrisToVideosStub(results.collection)
      }
          this.allVideosStub.sort((a, b) => b.convertedDate - a.convertedDate)

          if (this.allVideosStub.length > 9) {
            this.displayLoadMore = true
            this.displayVideosStub = this.allVideosStub.slice(0, 9);
           } else this.displayVideosStub = this.allVideosStub;

          this.cdr.detectChanges()
       
    })
  }

  loadMore(e: HTMLElement) {
    this.displayVideosStub = this.allVideosStub;
    e.remove();
 }

 pushUrisToVideosStub(collection: any){
  for (const uri of collection) {
    if (!uri.externalUriCategoryTag.includes('EVAC-ORDER')) {
      this.allVideosStub.push({
        title: uri.externalUriDisplayLabel,
        uploadedDate: new Date(uri.createdTimestamp).toLocaleDateString(),
        convertedDate: new Date(uri.createdTimestamp),
        fileName: '',
        type: 'video',
        href: uri.externalUri
      })
    }
  }
}

    
}

