import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from '../header-text-card/header-text-card.component';
import { UpdateFrequencyCardComponent } from './update-frequency-card.component';

const meta: Meta<UpdateFrequencyCardComponent> = {
  title: 'Cards/UpdateFrequencyCard',
  component: UpdateFrequencyCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [UpdateFrequencyCardComponent, ContentCardContainerComponent, HeaderTextCardComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<UpdateFrequencyCardComponent>;

export const example: Story = {
};
