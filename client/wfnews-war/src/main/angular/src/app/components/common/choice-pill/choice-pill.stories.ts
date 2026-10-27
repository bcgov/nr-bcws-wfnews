import { MatButtonModule } from '@angular/material/button';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ChoicePillComponent } from './choice-pill.component';

/**
 * The look comes from the wf1-choice-pill mixin. A story here shows a state, and no
 * story sends a colour, because a caller cannot.
 */
const meta: Meta<ChoicePillComponent> = {
  title: 'Buttons/ChoicePill',
  component: ChoicePillComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [MatButtonModule] })],
  args: {
    label: 'Within 25km',
    selected: false,
    toggle: true,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<ChoicePillComponent>;

export const unselected: Story = {};

export const selected: Story = {
  args: { selected: true },
};

// A coloured icon goes in as projected content, so it keeps its own colours.
export const withIcon: Story = {
  args: { label: 'Out of Control', selected: true },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-choice-pill [label]="label" [selected]="selected">
        <img src="/assets/images/svg-icons/out-of-control.svg" alt="" width="17" height="17">
      </wfnews-choice-pill>
    `,
  }),
};

// The 36px circle. The caller must give an ariaLabel.
export const iconOnly: Story = {
  args: { iconOnly: true, toggle: false, selected: true, ariaLabel: 'Filter' },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-choice-pill [iconOnly]="iconOnly" [toggle]="toggle" [selected]="selected"
        [ariaLabel]="ariaLabel">
        <img src="/assets/images/svg-icons/filter-button.svg" alt="" width="24" height="24">
      </wfnews-choice-pill>
    `,
  }),
};

// A group with one choice. The caller keeps the selection; the pill only shows it.
export const group: Story = {
  render: () => ({
    props: { picked: 50 },
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, 160px); gap: 8px;">
        <wfnews-choice-pill *ngFor="let r of [25, 50, 75, 100]" [label]="'Within ' + r + 'km'"
          [selected]="picked === r" (pillClicked)="picked = r"></wfnews-choice-pill>
      </div>
    `,
  }),
};
