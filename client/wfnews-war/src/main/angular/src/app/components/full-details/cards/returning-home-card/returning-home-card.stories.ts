import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { LinkButtonComponent } from '@app/components/common/link-button/link-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ReturningHomeCardComponent } from './returning-home-card.component';

const meta: Meta<ReturningHomeCardComponent> = {
  title: 'Cards/ReturningHomeCard',
  component: ReturningHomeCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ReturningHomeCardComponent, ContentCardContainerComponent, LinkButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ReturningHomeCardComponent>;

export const example: Story = {
};
