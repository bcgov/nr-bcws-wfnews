import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Category1FiresCardComponent } from './category-1-fires-card.component';

const meta: Meta<Category1FiresCardComponent> = {
  title: 'Cards/Category1FiresCard',
  component: Category1FiresCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [Category1FiresCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<Category1FiresCardComponent>;

export const example: Story = {
};
