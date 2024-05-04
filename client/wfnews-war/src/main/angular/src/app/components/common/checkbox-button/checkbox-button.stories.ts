import type { Meta, StoryObj } from '@storybook/angular';
import { CheckboxButtonComponent } from './checkbox-button.component';

const meta: Meta<CheckboxButtonComponent> = {
  title: 'Common/CheckboxButtonComponent',
  component: CheckboxButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxButtonComponent>;

export const orderNoCard: Story = {
  args: {
    checked: false,
  },
};
