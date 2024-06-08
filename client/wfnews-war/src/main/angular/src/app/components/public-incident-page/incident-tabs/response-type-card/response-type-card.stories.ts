import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ResponseTypeCardComponent } from './response-type-card.component';

const meta: Meta<ResponseTypeCardComponent> = {
  title: 'Cards/ResponseTypeCard',
  component: ResponseTypeCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ResponseTypeCardComponent, ContentCardContainerComponent, IconListItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ResponseTypeCardComponent>;

export const full: Story = {
  args: {
    responseTypeCode: 'FULL'
  }
};

export const monitored: Story = {
  args: {
    responseTypeCode: 'MONITOR'
  }
};

export const modified: Story = {
  args: {
    responseTypeCode: 'MODIFIED'
  }
};
