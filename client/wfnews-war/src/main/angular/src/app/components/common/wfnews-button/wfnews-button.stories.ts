import { action } from '@storybook/addon-actions';
import { type Meta, type StoryObj } from '@storybook/angular';
import { WfnewsButtonComponent } from './wfnews-button.component';

const meta: Meta<WfnewsButtonComponent> = {
  title: 'Buttons/WfnewsButton',
  component: WfnewsButtonComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<WfnewsButtonComponent>;

export const evacuationInformation: Story = {
  args: {
    label: 'Evacuee Registration and Assistance',
    componentStyle: {
      backgroundColor: '#EEEEEE',
      labelColor: '#242424',
      border: '1px solid #C7C7C7;'
    },
    clickHandler: () => {
      action('Button clicked');
      console.log('Button clicked');
    }
  },
};
