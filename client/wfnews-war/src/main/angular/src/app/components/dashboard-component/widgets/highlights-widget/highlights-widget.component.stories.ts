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
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'wp:featuredmedia': [{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            source_url: 'https://placeholder.com/200x100',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            alt_text: 'Test Image 1'
          }],
          // eslint-disable-next-line @typescript-eslint/naming-convention
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

export const example: Story = {
  args: {}
};
