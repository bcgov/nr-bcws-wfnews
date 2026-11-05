import { IncidentGalleryPanel } from './incident-gallery-panel.component';

describe('IncidentGalleryPanel', () => {
  let component: IncidentGalleryPanel;

  beforeEach(() => {
    component = new IncidentGalleryPanel(
      null as any,
      null as any,
      { detectChanges: () => {} } as any,
      { queryParams: { subscribe: () => {} } } as any
    );
  });

  it('should sort all media in descending chronological order (newest first)', () => {
    component.media = [
      {
        title: 'Older Video',
        uploadedDate: new Date('2024-05-10T10:00:00Z').valueOf(),
        type: 'video',
        href: 'https://video1',
      },
      {
        title: 'Newest Image',
        uploadedDate: new Date('2024-06-25T10:00:00Z').valueOf(),
        type: 'image',
        href: 'https://image1',
      },
      {
        title: 'Middle Image',
        uploadedDate: new Date('2024-05-20T10:00:00Z').valueOf(),
        type: 'image',
        href: 'https://image2',
      },
      {
        title: 'Different Month Earlier Day Image',
        uploadedDate: new Date('2024-07-02T10:00:00Z').valueOf(),
        type: 'image',
        href: 'https://image3',
      },
    ];

    const result = component.getAll(10);
    expect(result.map((m) => m.title)).toEqual([
      'Different Month Earlier Day Image', // July 2, 2024
      'Newest Image',                      // June 25, 2024
      'Middle Image',                      // May 20, 2024
      'Older Video',                       // May 10, 2024
    ]);
  });

  it('should sort images in descending chronological order (newest first)', () => {
    component.media = [
      {
        title: 'Image Day 28 May',
        uploadedDate: new Date('2024-05-28T00:00:00Z').valueOf(),
        type: 'image',
        href: 'https://image1',
      },
      {
        title: 'Image Day 2 June',
        uploadedDate: new Date('2024-06-02T00:00:00Z').valueOf(),
        type: 'image',
        href: 'https://image2',
      },
      {
        title: 'Video',
        uploadedDate: new Date('2024-06-15T00:00:00Z').valueOf(),
        type: 'video',
        href: 'https://video',
      },
    ];

    const result = component.getImages(10);
    expect(result.map((m) => m.title)).toEqual([
      'Image Day 2 June',
      'Image Day 28 May',
    ]);
  });

  it('should sort videos in descending chronological order (newest first)', () => {
    component.media = [
      {
        title: 'Video Day 28 May',
        uploadedDate: new Date('2024-05-28T00:00:00Z').valueOf(),
        type: 'video',
        href: 'https://video1',
      },
      {
        title: 'Video Day 2 June',
        uploadedDate: new Date('2024-06-02T00:00:00Z').valueOf(),
        type: 'video',
        href: 'https://video2',
      },
    ];

    const result = component.getVideos(10);
    expect(result.map((m) => m.title)).toEqual([
      'Video Day 2 June',
      'Video Day 28 May',
    ]);
  });
});

