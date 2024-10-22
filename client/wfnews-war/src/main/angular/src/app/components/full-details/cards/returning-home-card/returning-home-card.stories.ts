import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from '../header-text-card/header-text-card.component';
import { ReturningHomeCardComponent } from './returning-home-card.component';

const meta: Meta<ReturningHomeCardComponent> = {
  title: 'Cards/ReturningHomeCard',
  component: ReturningHomeCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ReturningHomeCardComponent, ContentCardContainerComponent, HeaderTextCardComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ReturningHomeCardComponent>;

export const example: Story = {
};
