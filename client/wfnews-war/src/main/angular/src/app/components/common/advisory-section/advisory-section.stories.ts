import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { AdvisorySectionComponent } from './advisory-section.component';


const meta: Meta<AdvisorySectionComponent> = {
  title: 'Banners/AdvisorySection',
  component: AdvisorySectionComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [IconButtonComponent, AdvisorySectionComponent],
    }),
  ]
};

export default meta;
type Story = StoryObj<AdvisorySectionComponent>;

export const evacuationInformation: Story = {
  args: {
    logoPath: '/assets/images/logo/emergency-info-bc.png',
    iconPath: '/assets/images/svg-icons/evacuation-order.svg',
    title: 'Evacuation Information',
    message: 'Go to Emergency Info BC for up-to-date evaucation information.',
    style: {
      backgroundColor: '#FFF5F6',
      dividerColor: '#E7DADA',
      iconCircleColor: '#FDCECE',
      outerBorderColor: '#F2D3D3'
    },
    button: {
      iconPath: '/assets/images/svg-icons/launch.svg',
      label: 'Evacuation Information',
      style: {
        backgroundColor: '#B91D38',
        labelColor: '#FFFFFF',
        iconColor: '#FFFFFF',
        border: 'none'
      },
      clickHandler: () => () => {
        console.log('Button clicked');
      },
    },
  },
};
