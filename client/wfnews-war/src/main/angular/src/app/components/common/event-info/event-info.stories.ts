import { CircleIconButtonComponent } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { EventInfoComponent } from './event-info.component';

const meta: Meta<EventInfoComponent> = {
  title: 'Components/EventInfo',
  component: EventInfoComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        EventInfoComponent, 
        IconListItemComponent, 
        CircleIconButtonComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<EventInfoComponent>;

export const example: Story = {
  args: {
  }
};
