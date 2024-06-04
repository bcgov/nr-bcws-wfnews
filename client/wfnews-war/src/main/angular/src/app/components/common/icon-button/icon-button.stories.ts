import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/angular';
import { IconButtonComponent } from './icon-button.component';

const meta: Meta<IconButtonComponent> = {
  title: 'Buttons/IconButton',
  component: IconButtonComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<IconButtonComponent>;

export const defaultStyle: Story = {
  args: {
    label: 'Action',
    iconPath: '/assets/images/svg-icons/red_warning.svg',
  },
};

export const evacuationInformation: Story = {
  args: {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/launch.svg',
    componentStyle: {
      backgroundColor: '#B91D38',
      labelColor: '#FFFFFF',
      iconColor: '#FFFFFF',
      border: 'none'
    },
    clickHandler: () => {
      action('Button clicked');
      console.log('Button clicked');
    }
  },
};

export const withNonMaskedIcon: Story = {
  args: {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/fire-note.svg',
    componentStyle: {
      backgroundColor: '#FFFFFF',
      labelColor: '#000000',
      border: '1 px solid #000000',
      overrideIconMask: true
    },
    clickHandler: () => {
      action('Button clicked');
      console.log('Button clicked');
    }
  },
};
