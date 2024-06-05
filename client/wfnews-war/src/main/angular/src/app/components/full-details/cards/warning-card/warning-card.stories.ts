import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from '../header-text-card/header-text-card.component';
import { WarningCardComponent } from './warning-card.component';

const meta: Meta<WarningCardComponent> = {
  title: 'Cards/WarningCard',
  component: WarningCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WarningCardComponent, ContentCardContainerComponent, HeaderTextCardComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WarningCardComponent>;

export const example: Story = {
};
