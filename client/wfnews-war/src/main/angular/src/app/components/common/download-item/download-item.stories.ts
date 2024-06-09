import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DownloadItemComponent } from './download-item.component';

const meta: Meta<DownloadItemComponent> = {
  title: 'Items/DownloadItem',
  component: DownloadItemComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [DownloadItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<DownloadItemComponent>;

export const example: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/pdf-file.svg',
    fileName: '23 DonnieCreekComplex 11x17L June02.pdf',
    date: 'Jul 22, 2023',
    linkUrl: 'https://www.google.com'
  }
};
