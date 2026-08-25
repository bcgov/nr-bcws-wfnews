import type { Meta, StoryObj } from '@storybook/angular';
import { PermissionBannerComponent } from './permission-banner.component';

const meta: Meta<PermissionBannerComponent> = {
  title: 'Banners/PermissionBanner',
  component: PermissionBannerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PermissionBannerComponent>;

export const notificationsOff: Story = {
  args: {
    heading: 'Notifications are off',
    message:
      'Your saved locations cannot send you wildfire alerts until notifications are on for this app.',
    actionLabel: 'Turn on notifications',
  },
};

export const notificationsDenied: Story = {
  args: {
    heading: 'Notifications are off',
    message:
      'Your saved locations cannot send you wildfire alerts until notifications are on for this app.',
    actionLabel: 'Open settings',
  },
};

// Location fails two ways, and each way needs its own settings page.
export const locationDenied: Story = {
  args: {
    heading: 'Location is off',
    message:
      'This app cannot find your position until location is on for this app.',
    actionLabel: 'Open settings',
  },
};

export const locationServicesOff: Story = {
  args: {
    heading: 'Location services are off',
    message:
      'Your phone has location turned off. Turn it on to find wildfires near you.',
    actionLabel: 'Open location settings',
  },
};
