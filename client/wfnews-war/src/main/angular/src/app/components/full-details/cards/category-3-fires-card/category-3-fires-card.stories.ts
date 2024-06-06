import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Category3FiresCardComponent } from './category-3-fires-card.component';

const meta: Meta<Category3FiresCardComponent> = {
  title: 'Cards/Category3FiresCard',
  component: Category3FiresCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [Category3FiresCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<Category3FiresCardComponent>;

export const example: Story = {
};
