import type { Meta, StoryObj } from '@storybook/angular';
import { PermissionBannerComponent } from './permission-banner.component';
import { PERMISSION_BANNER } from './permission-banner.constants';

const meta: Meta<PermissionBannerComponent> = {
  title: 'Banners/PermissionBanner',
  component: PermissionBannerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PermissionBannerComponent>;

const push = PERMISSION_BANNER.push;
const location = PERMISSION_BANNER.location;

export const notificationsOff: Story = {
  args: {
    heading: push.heading,
    message: push.message.savedLocations,
    actionLabel: push.action.turnOn,
  },
};

export const notificationsDenied: Story = {
  args: {
    heading: push.heading,
    message: push.message.savedLocations,
    actionLabel: push.action.appSettings,
  },
};

export const locationPrompt: Story = {
  args: {
    heading: location.heading.off,
    message: location.message.reportOfFire,
    actionLabel: location.action.turnOn,
  },
};

// Location fails two ways, and each way needs its own settings page.
export const locationDenied: Story = {
  args: {
    heading: location.heading.off,
    message: location.message.nearestFirst,
    actionLabel: location.action.appSettings,
  },
};

export const locationServicesOff: Story = {
  args: {
    heading: location.heading.servicesOff,
    message: location.message.nearestFirst,
    actionLabel: location.action.locationSettings,
  },
};
