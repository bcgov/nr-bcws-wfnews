import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { componentWrapperDecorator, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { MapToggleButtonComponent } from './map-toggle-button.component';

const meta: Meta<MapToggleButtonComponent> = {
  title: 'Buttons/MapToggleButton',
  component: MapToggleButtonComponent,
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
      imports: [MatButtonToggleModule],
    }),
    componentWrapperDecorator((story) =>
      // eslint-disable-next-line max-len
      `<mat-button-toggle-group multiple="false">${story}</mat-button-toggle-group>`
    ) 
  ],
};

export default meta;
type Story = StoryObj<MapToggleButtonComponent>;

export const fullWidth: Story = {
  args: {
    labelText: 'Map',
    labelIconPath: '../../../../assets/images/svg-icons/map.svg',
    value: 'map',
    checked: false,
  },
};

