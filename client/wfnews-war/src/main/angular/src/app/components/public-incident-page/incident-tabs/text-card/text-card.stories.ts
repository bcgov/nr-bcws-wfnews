import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { TextCardComponent } from './text-card.component';

const meta: Meta<TextCardComponent> = {
  title: 'Cards/TextCard',
  component: TextCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [TextCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<TextCardComponent>;

export const example: Story = {
  args: {
    text: 'Please see "Incident Details" tab for further information on current BC Wildfire Service Response.',
    backgroundColor: '#f5f5f5',
    textColor: '#5b5b5b',
  }
};
