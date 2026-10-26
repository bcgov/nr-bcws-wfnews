import { componentWrapperDecorator, type Meta } from '@storybook/angular';
import { MobileSlidingDrawerComponent } from './mobile-sliding-drawer.component';

const meta: Meta<MobileSlidingDrawerComponent> = {
  title: 'Menus/MobileSlidingDrawer',
  component: MobileSlidingDrawerComponent,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'white',
      values: [
        { name: 'grey', value: '#dddddd' },
        { name: 'white', value: '#ffffff' },
        { name: 'black', value: '#000000'}
      ],
    },
  },
  decorators: [
    componentWrapperDecorator((story) =>
      `<div class="bottom">${story}</div>`
    )
  ],
};

export default meta;

const template = (args: MobileSlidingDrawerComponent) => ({
  props: args,
  template: `
    <mobile-sliding-drawer
      [isVisible]="isVisible"
      [title]="title"
      [showBack]="showBack"
    >
      <p *ngFor="let line of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]">Content line {{ line }}</p>
      <div drawerFooter *ngIf="showBack">Footer</div>
    </mobile-sliding-drawer>
  `,
});

export const basic = template.bind({});
basic.args = {
  isVisible: true,
  title: 'Content Title',
  showBack: false,
} as Partial<MobileSlidingDrawerComponent>;

export const withBackAndFooter = template.bind({});
withBackAndFooter.args = {
  ...basic.args,
  showBack: true,
} as Partial<MobileSlidingDrawerComponent>;
