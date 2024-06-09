import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DownloadItemComponent } from '../download-item/download-item.component';
import { DownloadItemsContainerComponent } from './download-items-container.component';

const meta: Meta<DownloadItemsContainerComponent> = {
  title: 'Containers/DownloadItemsContainer',
  component: DownloadItemsContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [DownloadItemsContainerComponent, DownloadItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<DownloadItemsContainerComponent>;

export const example: Story = {
  args: {
    headerText: 'Map Downloads',
    iconPath: 'assets/images/svg-icons/pdf-file.svg',
    files: [
      {
        fileName: '23 DonnieCreekComplex 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Information map 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Information map 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Info Map June14.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Information map 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Information map 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      },
      {
        fileName: '23 DonnieCreekComplex Public Information map 11x17L June02.pdf',
        date: 'Jul 22, 2023',
        linkUrl: 'https://www.google.com'
      }
    ]
    
  }
};
