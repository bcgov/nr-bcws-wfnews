import { DragDropModule } from '@angular/cdk/drag-drop';
import { componentWrapperDecorator, moduleMetadata, type Meta } from '@storybook/angular';
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
    moduleMetadata({
      imports: [DragDropModule],
    }),
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
      [isGreyBackground]="isGreyBackground"
      [title]="title"
    >
      Content
    </mobile-sliding-drawer>
  `,
});

export const basic = template.bind({});
basic.args = {
  isVisible: true,
  isGreyBackground: false,
  title: 'Content Title',
} as Partial<MobileSlidingDrawerComponent>;
