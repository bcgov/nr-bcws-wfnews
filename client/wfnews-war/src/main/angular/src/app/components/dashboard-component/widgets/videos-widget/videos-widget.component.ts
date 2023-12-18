import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { convertToYoutubeId } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'videos-widget',
  templateUrl: './videos-widget.component.html',
  styleUrls: ['./videos-widget.component.scss'],
})
export class VideosWidget implements AfterViewInit {
  public startupComplete = false;
  public videos = [];

  convertToYoutubeId = convertToYoutubeId;

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private http: HttpClient,
    protected appConfigService: AppConfigService,
  ) {}

  ngAfterViewInit(): void {
    // attempt to fetch via the youtube API

    this.http
      .get(
        this.appConfigService.getConfig().application.baseUrl.toString() +
          'youtube.jsp',
      )
      .toPromise()
      .then((data) => {
        if ((data as any)?.items && (data as any)?.items.length > 0) {
          const videos = (data as any).items;
          for (const video of videos) {
            this.videos.push({
              externalUriGuid: video.etag,
              sourceObjectUniqueId: video.etag,
              externalUriDisplayLabel: video.snippet.title,
              externalUri: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            });
          }
          this.startupComplete = true;
        } else {
          throw Error('No videos found');
        }
      })
      .catch((err) => {
        console.error(err);
        // if that fails, load our own list
        this.publishedIncidentService
          .fetchExternalUriList(1, 100)
          .toPromise()
          .then((externalUris) => {
            if (
              externalUris &&
              externalUris.collection &&
              externalUris.collection.length > 0
            ) {
              const allVideos = externalUris.collection.filter(
                (v) => v.externalUriCategoryTag === 'video',
              );
              allVideos.sort((a, b) =>
                a.createdTimestamp > b.createdTimestamp
                  ? 1
                  : b.createdTimestamp > a.createdTimestamp
                    ? -1
                    : 0,
              );
              for (const video of allVideos) {
                if (
                  this.videos.filter((v) => v.externalUri == video.externalUri)
                    .length === 0
                ) {
                  this.videos.push({
                    externalUriGuid: video.externalUriGuid,
                    sourceObjectUniqueId: video.sourceObjectUniqueId,
                    externalUriDisplayLabel: video.externalUriDisplayLabel,
                    externalUri: video.externalUri,
                  });

                  if (this.videos.length === 5) {
                    break;
                  }
                }
              }

              this.startupComplete = true;
            }
          });
      });
  }
}
