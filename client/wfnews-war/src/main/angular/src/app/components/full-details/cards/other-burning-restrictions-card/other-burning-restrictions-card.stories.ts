import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { OtherBurningRestrictionsCardComponent } from './other-burning-restrictions-card.component';

const meta: Meta<OtherBurningRestrictionsCardComponent> = {
  title: 'Cards/OtherBurningRestrictionsCard',
  component: OtherBurningRestrictionsCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [OtherBurningRestrictionsCardComponent, ContentCardContainerComponent, IconListItemComponent, WfnewsButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<OtherBurningRestrictionsCardComponent>;

export const example: Story = {
};
