import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { WhereShouldIGoCardComponent } from './where-should-i-go-card.component';

const meta: Meta<WhereShouldIGoCardComponent> = {
  title: 'Cards/WhereShouldIGoCard',
  component: WhereShouldIGoCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WhereShouldIGoCardComponent, ContentCardContainerComponent, IconListItemComponent, WfnewsButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WhereShouldIGoCardComponent>;

export const example: Story = {
};
