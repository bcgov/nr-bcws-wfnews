import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
 providedIn: 'root',
})
export class YouTubeService {

 constructor(protected sanitizer: DomSanitizer) {}

 public sanitizeYoutubeUrl(url: string) {
    if (url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = url.match(regExp);
      const origin = window.location.origin;

      if (match && match[7].length == 11) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${match[7]}?origin=${origin}&playsinline=1`);
      }

      let newUrl = url.replace("www.youtube.com/watch?v=", "www.youtube-nocookie.com/embed/");
      if (newUrl.indexOf('?') === -1) {
        newUrl += '?';
      } else {
        newUrl += '&';
      }
      newUrl += `origin=${origin}&playsinline=1`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(newUrl);
    }
  }

}