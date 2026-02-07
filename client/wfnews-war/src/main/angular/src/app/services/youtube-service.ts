import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { AppConfigService } from "@wf1/core-ui";

@Injectable({
  providedIn: 'root',
})
export class YouTubeService {

  constructor(protected sanitizer: DomSanitizer, private appConfigService: AppConfigService) { }

  public sanitizeYoutubeUrl(url: string) {
    if (url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      const origin = window.location.origin;

      if (match && match[7].length == 11) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.appConfigService.getConfig().application.baseUrl.toString() + 'youtube-embed?v=' + match[7]);
      }

      let videoId = url.split('v=')[1];
      if (videoId) {
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.appConfigService.getConfig().application.baseUrl.toString() + 'youtube-embed?v=' + videoId);
      }

      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

}