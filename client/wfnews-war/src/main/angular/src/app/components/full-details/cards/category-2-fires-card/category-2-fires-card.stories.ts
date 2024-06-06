import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { Category2FiresCardComponent } from './category-2-fires-card.component';

const meta: Meta<Category2FiresCardComponent> = {
  title: 'Cards/Category2FiresCard',
  component: Category2FiresCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [Category2FiresCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<Category2FiresCardComponent>;

export const example: Story = {
};
