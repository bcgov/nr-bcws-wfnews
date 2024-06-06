import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from './header-text-card.component';

const meta: Meta<HeaderTextCardComponent> = {
  title: 'Cards/HeaderTextCard',
  component: HeaderTextCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [HeaderTextCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<HeaderTextCardComponent>;

export const short: Story = {
  args: {
    title: 'Title',
  },
  render: (args) => ({
    template: `
      <header-text-card title="${args.title}">
      Lorem ipsum
      </header-text-card>
    `,
  }),
};

export const long: Story = {
  args: {
    title: 'Title',
  },
  render: (args) => ({
    template: `
      <header-text-card title="${args.title}">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
      dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </header-text-card>
    `,
  }),
};

export const withSimpleHtml: Story = {
  args: {
    title: 'Title',
  },
  render: (args) => ({
    template: `
      <header-text-card title="${args.title}">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
      <br><br>
      Duis aute irure 
      dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </header-text-card>
    `,
  }),
};
