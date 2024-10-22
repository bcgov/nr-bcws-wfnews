import { type Meta, type StoryObj } from '@storybook/angular';
import { IconListItemComponent } from './icon-list-item.component';

const meta: Meta<IconListItemComponent> = {
  title: 'List Items/IconListItem',
  component: IconListItemComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<IconListItemComponent>;

export const football: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/american-football.svg',
    text: 'American Football',
  },
};

export const patio: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/patio_furniture.svg',
    text: 'Some of these emojis are random. Where do we even use these?',
  },
};

export const smallerIcons: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/patio_furniture.svg',
    text: 'Some of these emojis are random. Where do we even use these?',
    iconSize: 16,
    gapSize: 8
  },
};

export const mediumIcons: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/patio_furniture.svg',
    text: 'Some of these emojis are random. Where do we even use these?',
    iconSize: 20,
    gapSize: 8
  },
};
