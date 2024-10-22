import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { WfnewsSelectComponent } from './wfnews-select.component';

const meta: Meta<WfnewsSelectComponent> = {
  title: 'Combobox/WfnewsSelect',
  component: WfnewsSelectComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WfnewsSelectComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WfnewsSelectComponent>;

export const example: Story = {
  args: {
    selectedValue: 3,
    options: [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
      { value: 3, label: 'Option 3' },
      { value: 4, label: 'Option 4' },
      { value: 5, label: 'Option 5' },
    ],
  }
};
