import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/angular';
import { CircleIconButtonComponent } from './circle-icon-button.component';

const meta: Meta<CircleIconButtonComponent> = {
  title: 'Buttons/CircleIconButton',
  component: CircleIconButtonComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<CircleIconButtonComponent>;

export const defaultStyle: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/forward-arrow-grey.svg',
  },
};

export const evacuationInformation: Story = {
  args: {
    iconPath: '/assets/images/svg-icons/forward-arrow-grey.svg',
    componentStyle: {
      backgroundColor: '#B91D38',
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
    iconPath: '/assets/images/svg-icons/forward-arrow-grey.svg',
    componentStyle: {
      backgroundColor: '#FFFFFF',
      border: '1 px solid #000000',
      overrideIconMask: true
    },
    clickHandler: () => {
      action('Button clicked');
      console.log('Button clicked');
    }
  },
};
