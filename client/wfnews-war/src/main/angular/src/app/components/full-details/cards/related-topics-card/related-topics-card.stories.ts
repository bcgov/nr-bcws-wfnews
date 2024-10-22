import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { LinkButtonComponent } from '@app/components/common/link-button/link-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { RelatedTopicsCardComponent } from './related-topics-card.component';

const meta: Meta<RelatedTopicsCardComponent> = {
  title: 'Cards/RelatedTopicsCard',
  component: RelatedTopicsCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [RelatedTopicsCardComponent, ContentCardContainerComponent, LinkButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<RelatedTopicsCardComponent>;

export const example: Story = {
};

export const linksProvided: Story = {
  args: {
    links: [
      { text: 'Link 1', url: 'https://google.com' },
      { text: 'Link 2', url: 'https://bing.com' },
      { text: 'Link 3', url: 'https://yahoo.com' }
    ]
  }
};
