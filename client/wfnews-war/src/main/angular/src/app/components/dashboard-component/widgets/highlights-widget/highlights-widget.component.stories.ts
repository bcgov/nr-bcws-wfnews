import { HighlightsWidgetComponent } from './highlights-widget.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';

// Mock HTTP Client
class MockHttpClient {
  get(): Observable<any> {
    // Mock tag response
    const tagResponse = [{ id: 1, name: 'app' }];
    
    // Mock posts response
    const postsResponse = [
      {
        id: 1,
        date: '2024-03-20T12:00:00',
        title: { rendered: 'Test Post 1' },
        link: 'https://example.com/post1',
        tags: [1],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://placeholder.com/200x100',
            alt_text: 'Test Image 1'
          }],
          'wp:term': [
            [], // First array is empty (categories)
            [  // Second array contains tags
              { name: 'app' },
              { name: 'KFC' }
            ]
          ]
        }
      }
    ];

    // Return mock data based on URL
    return of(postsResponse);
  }
}


const meta: Meta<HighlightsWidgetComponent> = {
  title: 'Widgets/HighlightsWidgetComponent',
  component: HighlightsWidgetComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        HttpClientModule
      ],
      declarations: [HighlightsWidgetComponent],
      providers: [
        { provide: HttpClient, useClass: MockHttpClient }
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<HighlightsWidgetComponent>;

export const SingleFireCentres: Story = {
  args: {
    posts: [{
      id: 1,
      title: 'Smoke from pile burning visible in Kamloops Fire Centre',
      date: 'October 21, 2024',
      thumbnail: {
        url: 'https://blog.gov.bc.ca/app/uploads/sites/786/2023/02/SocialMedia_PrescribedFire_KFC-FB.jpg',
        alt: 'Forest fire prevention image'
      },
      fireCentres: ['KFC'],
      link: 'https://example.com/wildfire-prevention',
      tags: [
        { name: 'app' },
        { name: 'KFC' }
      ]
    }]
  }
};

export const MultipleFireCentres: Story = {
  args: {
    posts: [
      {
        id: 2,
        title: 'Super prescribed burn across multiple provinces',
        date: 'October 23, 2024',
        thumbnail: {
          url: 'https://blog.gov.bc.ca/app/uploads/sites/786/2022/07/SocialMedia_PrescribedFire_KFC-FB.jpg',
          alt: 'Emergency response team'
        },
        fireCentres: ['VIFC', 'CFC', 'SEFC'],
        link: 'https://example.com/emergency-response',
        tags: [
          { name: 'app' },
          { name: 'VIFC' },
          { name: 'CFC' },
          { name: 'SEFC' },
        ]
      }
    ]
  }
};

export const NoThumbnail: Story = {
  args: {
    posts: [
      {
        id: 5,
        title: 'Important Alert: prescribed burn smoke visible near Lac Le Jeune',
        date: 'October 22, 2024',
        thumbnail: {
          url: '',
          alt: 'Prescribed fire image'
        },
        fireCentres: ['KFC'],
        link: 'https://example.com/risk-assessment',
        tags: [
          { name: 'app' },
          { name: 'KFC' }
        ]
      }
    ]
  }
};