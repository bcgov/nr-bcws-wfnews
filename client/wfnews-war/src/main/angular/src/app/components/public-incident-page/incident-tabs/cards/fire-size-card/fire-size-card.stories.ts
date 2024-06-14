import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { FireSizeCardComponent } from './fire-size-card.component';

const meta: Meta<FireSizeCardComponent> = {
  title: 'Cards/FireSizeCard',
  component: FireSizeCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [FireSizeCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<FireSizeCardComponent>;

export const example: Story = {
  args: {
  }
};

export const passedInValues: Story = {
  args: {
    fireSize: 1000,
    description: 'This is a description'
  }
};
