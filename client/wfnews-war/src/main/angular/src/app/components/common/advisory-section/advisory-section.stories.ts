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

export const evacuationInformationOrder: Story = {
  args: {
    logoPath: '/assets/images/logo/emergency-info-bc.png',
    iconPath: '/assets/images/svg-icons/evacuation-order.svg',
    title: 'Evacuation Information',
    message: 'Go to Emergency Info BC for up-to-date evaucation information.',
    componentStyle: {
      backgroundColor: '#FFF5F6',
      dividerColor: '#E7DADA',
      iconCircleColor: '#FDCECE',
      outerBorderColor: '#F2D3D3'
    },
    button: {
      iconPath: '/assets/images/svg-icons/launch.svg',
      label: 'Evacuation Information',
      componentStyle: {
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

export const evacuationInformationAlert: Story = {
  args: {
    logoPath: '/assets/images/logo/emergency-info-bc.png',
    iconPath: '/assets/images/svg-icons/evacuation-alert.svg',
    title: 'Evacuation Information',
    message: 'Go to Emergency Info BC for up-to-date evaucation information.',
    componentStyle: {
      backgroundColor: '#FFFAEB',
      dividerColor: '#EEE8D3',
      iconCircleColor: '#FEEFBE',
      outerBorderColor: '#F5E8BA'
    },
    button: {
      iconPath: '/assets/images/svg-icons/launch.svg',
      label: 'Evacuation Information',
      componentStyle: {
        backgroundColor: '#8F7100',
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
