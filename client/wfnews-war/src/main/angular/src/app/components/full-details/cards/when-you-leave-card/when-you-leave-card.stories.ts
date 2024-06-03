import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { WarningBannerComponent } from '@app/components/common/warning-banner/warning-banner.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { WhenYouLeaveCardComponent } from './when-you-leave-card.component';

const meta: Meta<WhenYouLeaveCardComponent> = {
  title: 'Cards/WhenYouLeaveCard',
  component: WhenYouLeaveCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WhenYouLeaveCardComponent, ContentCardContainerComponent, IconListItemComponent, WarningBannerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WhenYouLeaveCardComponent>;

export const example: Story = {
};
