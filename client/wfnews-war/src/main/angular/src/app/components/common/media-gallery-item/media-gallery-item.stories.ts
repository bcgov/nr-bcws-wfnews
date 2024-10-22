import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MediaGalleryItemComponent } from './media-gallery-item.component';

const meta: Meta<MediaGalleryItemComponent> = {
  title: 'Items/MediaGalleryItem',
  component: MediaGalleryItemComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [MediaGalleryItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<MediaGalleryItemComponent>;

export const image: Story = {
  args: {
    item: {
      title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
      uploadedDate: Date.parse('May 20, 2024'),
      fileName: 'file.jpg',
      type: 'image',
      href: 'https://picsum.photos/1100/800',
      thumbnail: 'https://picsum.photos/1100/800',
      loaded: true
    }
  }
};

export const video: Story = {
  args: {
    item: {
      title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
      uploadedDate: Date.parse('May 20, 2024'),
      fileName: 'file.jpg',
      type: 'video',
      href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
      loaded: true
    }
  }
};
