import { type Meta, type StoryObj } from '@storybook/angular';
import { ContentCardContainerComponent } from './content-card-container.component';

const meta: Meta<ContentCardContainerComponent> = {
  title: 'Containers/ContentCardContainer',
  component: ContentCardContainerComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ContentCardContainerComponent>;

export const shortOne: Story = {
  render: () => ({
    template: `
      <content-card-container>
      This is the content for a short one.
      </content-card-container>`
  }),
};

export const typicalUsage: Story = {
  render: () => ({
    template: `
      <content-card-container>
      <h1>This is the content for a longer and more dynamic one.</h1>
      <hr>
      Might have things like headers and line breaks.
      <p>And paragraphs.</p>
      And the content should grow and shrink as neeeded.
      </content-card-container>`
  }),
};

