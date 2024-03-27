import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
 providedIn: 'root',
})
export class YouTubeService {

 constructor(protected sanitizer: DomSanitizer) {}

 public sanitizeYoutubeUrl(url: string) {
    if (url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url.replace("www.youtube.com/watch?v=", "www.youtube-nocookie.com/embed/"))
    }
  }

}