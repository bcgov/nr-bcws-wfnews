import { Component, OnInit } from '@angular/core';
import { CommonUtilityService } from '@app/services/common-utility.service';
import { readableDate } from '@app/utils';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  link: string;
  tags: number[];
  _embedded?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'wp:featuredmedia'?: [{
      // eslint-disable-next-line @typescript-eslint/naming-convention
      source_url: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      alt_text?: string;
    }];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'wp:term'?: Array<Array<{
      name: string;
    }>>;
  };
}

interface Tag {
  name: string;
}

export interface ProcessedPost {
  id: number;
  date: string;
  title: string;
  link: string;
  thumbnail: {
    url: string | null;
    alt: string;
  };
  tags: Tag[];
  fireCentres: string[];
}

@Component({
  selector: 'highlights-widget',
  templateUrl: './highlights-widget.component.html',
  styleUrls: ['./highlights-widget.component.scss']
})
export class HighlightsWidgetComponent implements OnInit {
  posts: ProcessedPost[] = [];
  readableDate = readableDate;
  apiUrl = 'https://blog.gov.bc.ca/bcwildfire/wp-json/wp/v2';
  appTagSlug = 'app';

  constructor(private commonUtilityService: CommonUtilityService) { }

  ngOnInit(): void {
    this.populateTags();
  }

  populateTags() {
    try {
      this.getAllAppPosts().subscribe(result => {
        this.posts = result;
      });
    } catch (error) {
      console.error('Error retrieving blog posts: ' + error);
    }
  }

  // Get all posts with the app tag
  getAllAppPosts(): Observable<ProcessedPost[]> {
    return this.getTagBySlug(this.appTagSlug).pipe(
      switchMap(tagId => {
        if (!tagId) {
          throw new Error('App tag not found');
        }
        return this.fetchAllPostsWithTag(tagId);
      }),
      catchError(error => {
        console.error('Error fetching app posts:', error);
        return of([]);
      })
    );
  }

  // Helper to get tag ID from slug
  private getTagBySlug(slug: string): Observable<number | null> {
    const url = `${this.apiUrl}/tags?slug=${slug}`;

    return this.commonUtilityService.getRequest<any[]>(url).pipe(
      map(tags => tags[0]?.id || null),
      catchError(error => {
        console.error('Error fetching tag:', error);
        return of(null);
      })
    );
  }

  // Helper to fetch all posts at once with tags
  private fetchAllPostsWithTag(tagId: number): Observable<ProcessedPost[]> {
    const url = `${this.apiUrl}/posts?tags=${tagId}&_embed&per_page=15`;

    return this.commonUtilityService.getRequest<WordPressPost[]>(url).pipe(
      map(posts => posts.map(post => this.processPost(post))),
      catchError(error => {
        console.error('Error fetching posts:', error);
        return of([]);
      })
    );
  }

  // Helper to process a post into a cleaner format
  private processPost(post: WordPressPost): ProcessedPost {
    const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
    const tags = post._embedded?.['wp:term']?.[1] || [];  // wp:term[1] contains tags

    // Find all fire centre tags (ending in FC)
    const fireCentreTags = tags.filter(tag => tag.name.endsWith('FC'));

    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      id: post.id,
      date: formattedDate,
      title: post.title.rendered,
      link: post.link,
      thumbnail: {
        url: featuredMedia?.source_url || null,
        alt: featuredMedia?.alt_text || ''
      },
      tags: tags.map(tag => ({
        name: tag.name,
      })),
      fireCentres: fireCentreTags.map(tag => tag.name)  // Array of fire centre names
    };
  }
}
