import { type Meta, type StoryObj } from '@storybook/angular';
import { IconInfoChipComponent } from './icon-info-chip.component';

const meta: Meta<IconInfoChipComponent> = {
  title: 'Chips/IconInfoChip',
  component: IconInfoChipComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<IconInfoChipComponent>;

export const defaultStyle: Story = {
  args: {
    label: 'Action',
    iconPath: '/assets/images/svg-icons/evacuation-order.svg',
  },
};

export const evacuationOrder: Story = {
  args: {
    label: 'Order',
    iconPath: '/assets/images/svg-icons/evacuation-order.svg',
    componentStyle: {
      backgroundColor: '#FEF1F2',
      labelColor: '#98273B',
      iconColor: '#98273B',
      border: '1px solid #F4CFCF'
    },
  },
};

export const wildfireOfNote: Story = {
  args: {
    label: 'Wildfire of Note',
    iconPath: '/assets/images/svg-icons/fire-note.svg',
    componentStyle: {
      backgroundColor: '#FFFFFF',
      labelColor: '#98273B',
      border: '1px solid #AA1D3E',
      slim: true,
      overrideIconMask: true
    },
  },
};
