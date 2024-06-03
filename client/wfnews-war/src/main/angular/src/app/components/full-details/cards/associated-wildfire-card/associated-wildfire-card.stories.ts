import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AssociatedWildfireCardComponent } from './associated-wildfire-card.component';

const meta: Meta<AssociatedWildfireCardComponent> = {
  title: 'Cards/AssociatedWildfireCard',
  component: AssociatedWildfireCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [AssociatedWildfireCardComponent, ContentCardContainerComponent, IconListItemComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<AssociatedWildfireCardComponent>;

export const example: Story = {
};
