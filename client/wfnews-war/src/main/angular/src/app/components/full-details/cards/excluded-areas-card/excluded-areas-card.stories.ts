import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ExcludedAreasCardComponent } from './excluded-areas-card.component';

const meta: Meta<ExcludedAreasCardComponent> = {
  title: 'Cards/ExcludedAreasCard',
  component: ExcludedAreasCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ExcludedAreasCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ExcludedAreasCardComponent>;

export const example: Story = {
};
