import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { CheckboxButtonComponent } from './checkbox-button.component';

const meta: Meta<CheckboxButtonComponent> = {
  title: 'Buttons/CheckboxButton',
  component: CheckboxButtonComponent,
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<CheckboxButtonComponent>;

export const fullWidth: Story = {
  args: {
    checked: false,
  },
  render: (args) => ({
    template: `
      <checkbox-button [checked]="${args.checked}">Content Label</checkbox-button>
    `,
    props: args,
  })
};

export const halfWidth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const startingValue = canvas.getByRole('checkbox').ariaChecked === 'true' ? true : false;

    await userEvent.click(canvas.getByRole('button'), { delay: 2000 });
    await expect(canvas.getByRole('checkbox').ariaChecked).toEqual((!startingValue).toString());

    await userEvent.click(canvas.getByRole('button'), { delay: 2000 });
    await expect(canvas.getByRole('checkbox').ariaChecked).toEqual(startingValue.toString());
  },
  args: {
    checked: true,
  },
  decorators: [
    componentWrapperDecorator((story) => `<div style="width: 50%;">${story}</div>`),
  ],
  render: (args) => ({
    template: `
      <checkbox-button [checked]="${args.checked}">Content Label</checkbox-button>
    `,
    props: args,
  })
};
