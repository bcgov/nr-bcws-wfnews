import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { LinkButtonComponent } from './link-button.component';

const meta: Meta<LinkButtonComponent> = {
  title: 'Buttons/LinkButton',
  component: LinkButtonComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<LinkButtonComponent>;

export const fullWidth: Story = {
  args: {
    text: 'Google',
    subtext: 'This will take you to Google.',
    link: 'https://google.com',
  },
};

export const halfWidth: Story = {
  args: {
    text: 'Bing',
    subtext: 'This will take you to Bing.',
    link: 'https://bing.com',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
};

export const longSubtitle: Story = {
  args: {
    text: 'Bing',
    subtext: 'This will take you to Bing, but first it might take you to a different page, and then to Bing.',
    link: 'https://bing.com',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
};

export const longTitle: Story = {
  args: {
    text: 'Do people even use Yahoo anymore? How about AltaVista? or Ask Jeeves?',
    subtext: 'This will take you to Yahoo.',
    link: 'https://bing.com',
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
};

export const noSubtext: Story = {
  args: {
    text: 'Only the title',
    link: 'https://bing.com',
    iconColor: '#909090'
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
};
