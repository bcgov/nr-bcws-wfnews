import { type Meta, type StoryObj } from '@storybook/angular';
import { WfnewsButtonComponent } from './wfnews-button.component';

/**
 * The look comes from the BC Gov Design System Button. A story here shows a variant or a
 * size, and no story sends a colour, because a caller cannot.
 */
const meta: Meta<WfnewsButtonComponent> = {
  title: 'Buttons/WfnewsButton',
  component: WfnewsButtonComponent,
  tags: ['autodocs'],
  args: {
    label: 'Save',
    variant: 'primary',
    size: 'medium',
    danger: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'link',
        'evacuationOrder',
        'evacuationAlert',
      ],
    },
    size: {
      control: 'radio',
      options: ['xsmall', 'small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<WfnewsButtonComponent>;

export const primary: Story = {};

export const secondary: Story = {
  args: { variant: 'secondary', label: 'Cancel' },
};

export const tertiary: Story = {
  args: { variant: 'tertiary', label: 'Skip' },
};

export const link: Story = {
  args: { variant: 'link', label: 'Read the guide' },
};

/**
 * The two advisory ranks. They carry the wildfire domain colours, because the Design
 * System has no solid fill for a warning, and its danger red reads at 4.80:1 against
 * white where the Evacuation Order red reads at 6.37:1.
 */
export const evacuationOrder: Story = {
  args: { variant: 'evacuationOrder', label: 'Evacuation Information' },
};

export const evacuationAlert: Story = {
  args: { variant: 'evacuationAlert', label: 'Evacuation Information' },
};

// An icon given as a file path. A mask draws it, so it takes the colour of the variant.
export const withIconPath: Story = {
  args: {
    variant: 'secondary',
    label: 'Call Us',
    iconPath: '/assets/images/svg-icons/carbon_phone.svg',
  },
};

// Red, for an action the user cannot undo.
export const danger: Story = {
  args: { danger: true, label: 'Delete' },
};

export const disabled: Story = {
  args: { disabled: true },
};

// The four heights: 24px, 32px, 40px and 48px.
export const sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 8px;">
        <wfnews-button size="xsmall" label="xsmall"></wfnews-button>
        <wfnews-button size="small" label="small"></wfnews-button>
        <wfnews-button size="medium" label="medium"></wfnews-button>
        <wfnews-button size="large" label="large"></wfnews-button>
      </div>
    `,
  }),
};

/**
 * An icon goes in as projected content, before the label. It must carry
 * fill="currentColor", so it takes the colour of the variant. A .svg file in an <img> tag
 * cannot do that, and stays black on a dark fill.
 */
const downloadIcon = `
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1v8.6l3-3 .7.7-4.2 4.2L3.3 7.3l.7-.7 3 3V1h1z"/>
    <path d="M2 13h12v1H2z"/>
  </svg>
`;

// An icon and a label together.
export const withIcon: Story = {
  args: { variant: 'secondary', label: 'Download PDF' },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-button [variant]="variant" [label]="label">${downloadIcon}</wfnews-button>
    `,
  }),
};

// An icon after the label. The iconEnd attribute picks the trailing slot.
export const withTrailingIcon: Story = {
  args: { variant: 'primary', label: 'Next' },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-button [variant]="variant" [label]="label">
        <svg iconEnd viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M9 2.3 8.3 3l4 4H2v1h10.3l-4 4 .7.7L14.3 7.5 9 2.3z"/>
        </svg>
      </wfnews-button>
    `,
  }),
};

// The same icon on every variant. It takes the colour of each one.
export const iconOnEveryVariant: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 8px;">
        <wfnews-button variant="primary" label="Primary">${downloadIcon}</wfnews-button>
        <wfnews-button variant="secondary" label="Secondary">${downloadIcon}</wfnews-button>
        <wfnews-button variant="tertiary" label="Tertiary">${downloadIcon}</wfnews-button>
        <wfnews-button variant="link" label="Link">${downloadIcon}</wfnews-button>
      </div>
    `,
  }),
};

/**
 * A square that holds one icon and no label. The caller must give an ariaLabel, because
 * a screen reader then has words to read.
 */
export const iconOnly: Story = {
  args: { variant: 'secondary', iconOnly: true, ariaLabel: 'Download PDF' },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-button [variant]="variant" [iconOnly]="iconOnly"
        [ariaLabel]="ariaLabel">${downloadIcon}</wfnews-button>
    `,
  }),
};

// The four icon-only squares: 24px, 32px, 40px and 48px.
export const iconOnlySizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 8px;">
        <wfnews-button variant="secondary" size="xsmall" [iconOnly]="true"
          ariaLabel="Download, extra small">${downloadIcon}</wfnews-button>
        <wfnews-button variant="secondary" size="small" [iconOnly]="true"
          ariaLabel="Download, small">${downloadIcon}</wfnews-button>
        <wfnews-button variant="secondary" size="medium" [iconOnly]="true"
          ariaLabel="Download, medium">${downloadIcon}</wfnews-button>
        <wfnews-button variant="secondary" size="large" [iconOnly]="true"
          ariaLabel="Download, large">${downloadIcon}</wfnews-button>
      </div>
    `,
  }),
};

// Red and icon-only, for an action the user cannot undo.
export const iconOnlyDanger: Story = {
  args: { variant: 'primary', danger: true, iconOnly: true, ariaLabel: 'Delete' },
  render: (args) => ({
    props: args,
    template: `
      <wfnews-button [variant]="variant" [danger]="danger" [iconOnly]="iconOnly"
        [ariaLabel]="ariaLabel">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M6 2h4v1h4v1H2V3h4V2zm-2 3h8l-.6 9H4.6L4 5zm2.4 1 .4 7h.9l-.3-7h-1zm3.2 0-.3 7h.9l.4-7h-1z"/>
        </svg>
      </wfnews-button>
    `,
  }),
};

// A long label on a narrow measure. The button grows down, and the words wrap.
export const longLabel: Story = {
  args: {
    variant: 'secondary',
    label: 'Evacuee Registration and Assistance',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 310px;">
        <wfnews-button [variant]="variant" [label]="label"></wfnews-button>
      </div>
    `,
  }),
};
