import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { CheckboxButtonComponent } from './checkbox-button.component';

const meta: Meta<CheckboxButtonComponent> = {
  title: 'Buttons/CheckboxButton',
  component: CheckboxButtonComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<CheckboxButtonComponent>;

export const fullWidth: Story = {
  args: {
    checked: false,
  },
};

export const halfWidth: Story = {
  args: {
    checked: true,
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
};
