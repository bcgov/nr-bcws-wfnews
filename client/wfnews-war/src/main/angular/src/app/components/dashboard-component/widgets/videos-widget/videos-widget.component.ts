import { AfterViewInit, Component } from "@angular/core"
import { PublishedIncidentService } from "@app/services/published-incident-service"
import { convertToYoutubeId } from "@app/utils"

@Component({
  selector: 'videos-widget',
  templateUrl: './videos-widget.component.html',
  styleUrls: ['./videos-widget.component.scss']
})
export class VideosWidget implements AfterViewInit {
  public startupComplete = false
  public videos = []

  convertToYoutubeId = convertToYoutubeId

  constructor(private publishedIncidentService: PublishedIncidentService) { }

  ngAfterViewInit (): void {
    this.publishedIncidentService.fetchExternalUriList(1, 100).toPromise()
    .then(externalUris => {
      if (externalUris && externalUris.collection && externalUris.collection.length > 0) {
        const allVideos = externalUris.collection.filter(v => v.externalUriCategoryTag === 'video')
        allVideos.sort((a,b) =>(a.createdTimestamp > b.createdTimestamp) ? 1 : ((b.createdTimestamp > a.createdTimestamp) ? -1 : 0))
        for (let video of allVideos) {
          if (this.videos.filter(v => v.externalUri == video.externalUri).length === 0) {
            this.videos.push({
              externalUriGuid: video.externalUriGuid,
              sourceObjectUniqueId: video.sourceObjectUniqueId,
              externalUriDisplayLabel: video.externalUriDisplayLabel,
              externalUri: video.externalUri
            })

            if (this.videos.length === 5) {
              break
            }
          }
        }

        this.startupComplete = true
      }
    })
  }
}
