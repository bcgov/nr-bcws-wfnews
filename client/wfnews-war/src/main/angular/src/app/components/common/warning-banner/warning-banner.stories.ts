import type { Meta, StoryObj } from '@storybook/angular';
import { WarningBannerComponent } from './warning-banner.component';

const meta: Meta<WarningBannerComponent> = {
  title: 'Banners/WarningBanner',
  component: WarningBannerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<WarningBannerComponent>;

export const defaultStyle: Story = {
  args: {
    label: 'Only perform the following tasks if there is time and it is safe to do so.',
    iconPath: '/assets/images/svg-icons/red_warning.svg',
  },
};


export const warningExample: Story = {
  args: {
    label: 'Only perform the following tasks if there is time and it is safe to do so.',
    iconPath: '/assets/images/svg-icons/red_warning.svg',
    componentStyle: {
      backgroundColor: '#FEF1F2',
      labelColor: '#242424',
      iconColor: '#D8292F',
      border: '1.5px solid #D8292F'
    },
  },
};

export const nonMaskedIcon: Story = {
  args: {
    label: 'Only perform the following tasks if there is time and it is safe to do so.',
    iconPath: '/assets/images/svg-icons/fire-note.svg',
    componentStyle: {
      backgroundColor: '#FEF1F2',
      labelColor: '#242424',
      iconColor: '#D8292F',
      border: '1.5px solid #D8292F',
      overrideIconMask: true
    },
  },
};
