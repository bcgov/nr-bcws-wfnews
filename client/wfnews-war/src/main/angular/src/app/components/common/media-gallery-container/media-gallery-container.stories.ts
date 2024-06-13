import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LightgalleryComponent } from 'lightgallery/angular/13';
import { MediaGalleryItemComponent } from '../media-gallery-item/media-gallery-item.component';
import { WfnewsButtonComponent } from '../wfnews-button/wfnews-button.component';
import { WfnewsSelectComponent } from '../wfnews-select/wfnews-select.component';
import { MediaGalleryContainerComponent } from './media-gallery-container.component';

const meta: Meta<MediaGalleryContainerComponent> = {
  title: 'Containers/MediaGalleryContainer',
  component: MediaGalleryContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        MediaGalleryContainerComponent, 
        MediaGalleryItemComponent, 
        WfnewsButtonComponent, 
        WfnewsSelectComponent, 
        LightgalleryComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<MediaGalleryContainerComponent>;

export const example: Story = {
  args: {
    items: [
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'image',
        href: 'https://picsum.photos/1100/800',
        thumbnail: 'https://picsum.photos/1100/800',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'video',
        href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'image',
        href: 'https://picsum.photos/1100/800',
        thumbnail: 'https://picsum.photos/1100/800',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'video',
        href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'image',
        href: 'https://picsum.photos/1100/800',
        thumbnail: 'https://picsum.photos/1100/800',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'video',
        href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'image',
        href: 'https://picsum.photos/1100/800',
        thumbnail: 'https://picsum.photos/1100/800',
        loaded: true
      },
      {
        title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
        uploadedDate: Date.parse('May 20, 2024'),
        fileName: 'file.jpg',
        type: 'video',
        href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
        loaded: true
      },
    ]
  }
};
