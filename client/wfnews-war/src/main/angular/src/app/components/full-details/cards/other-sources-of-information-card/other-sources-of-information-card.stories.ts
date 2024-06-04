import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OtherSourcesWhenYouLeaveCardComponent } from './other-sources-of-information-card.component';

const meta: Meta<OtherSourcesWhenYouLeaveCardComponent> = {
  title: 'Cards/OtherSourcesWhenYouLeaveCard',
  component: OtherSourcesWhenYouLeaveCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [OtherSourcesWhenYouLeaveCardComponent, ContentCardContainerComponent, IconListItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<OtherSourcesWhenYouLeaveCardComponent>;

export const example: Story = {
};
