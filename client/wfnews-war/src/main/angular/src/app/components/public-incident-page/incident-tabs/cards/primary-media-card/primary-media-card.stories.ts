import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LightgalleryComponent } from 'lightgallery/angular/13';
import { PrimaryMediaCardComponent } from './primary-media-card.component';

const meta: Meta<PrimaryMediaCardComponent> = {
  title: 'Cards/PrimaryMediaCard',
  component: PrimaryMediaCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        PrimaryMediaCardComponent,
        LightgalleryComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<PrimaryMediaCardComponent>;

export const image: Story = {
  args: {
    item: {
      title: 'Image',
      uploadedDate: '5/30/2024',
      fileName: 'image.jpg',
      type: 'image',
      href: 'https://picsum.photos/1100/1100',
      thumbnailUrl: 'https://picsum.photos/1100/1100'
    },
  }
};

export const video: Story = {
  args: {
    item: {
      title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
      uploadedDate: '5/30/2024',
      fileName: 'file.jpg',
      type: 'video',
      href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
    }
  }
};

export const imageWithPreviewWarning: Story = {
  args: {
    item: {
      title: 'Image',
      uploadedDate: '5/30/2024',
      fileName: 'image.jpg',
      type: 'image',
      href: 'https://picsum.photos/1100/1100',
      thumbnailUrl: 'https://picsum.photos/1100/1100'
    },
    showPreviewWarning: true
  }
};

export const videoWithPreviewWarning: Story = {
  args: {
    item: {
      title: '23 - G80280 - IMG_0352 Buckinghorse rainy mop up June 17.jpeg',
      uploadedDate: '5/30/2024',
      fileName: 'file.jpg',
      type: 'video',
      href: 'https://www.youtube-nocookie.com/embed/5hghT1W33cY',
    },
    showPreviewWarning: true
  }
};

