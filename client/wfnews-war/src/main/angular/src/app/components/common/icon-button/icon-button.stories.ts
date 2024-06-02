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

export const evacuationInformation: Story = {
  args: {
    label: 'Evacuation Information',
    iconPath: '/assets/images/svg-icons/launch.svg',
    style: {
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
