import type { Meta, StoryObj } from '@storybook/angular';
import { AlertOrderBannerComponent } from './alert-order-banner.component';

const meta: Meta<AlertOrderBannerComponent> = {
  title: 'Banners/AlertOrderBanner',
  component: AlertOrderBannerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<AlertOrderBannerComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const orderNoCard: Story = {
  args: {
    evacuation: {
      orderAlertStatus: 'Order',
      eventName: 'Event Name',
      issuingAgency: 'Some Agency',
    },
    isCard: false,
  },
};

export const alertCard: Story = {
  args: {
    areaRestriction: {
      name: 'Area Name',
    },
    isCard: true,
  },
};

export const evacuationAlert: Story = {
  args: {
    evacuation: {
      orderAlertStatus: 'Alert',
      eventName: 'Event Name',
      issuingAgency: 'Some Agency',
    },
    isCard: true,
  },
};

