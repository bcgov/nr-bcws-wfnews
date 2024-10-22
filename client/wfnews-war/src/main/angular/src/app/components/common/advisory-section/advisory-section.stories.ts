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
    
    title: 'Evacuation Information',
    message: 'Go to Emergency Info BC for up-to-date evacuation information.',
    componentStyle: {
      backgroundColor: '#FFF5F6',
      dividerColor: '#E7DADA', 
      outerBorderColor: '#F2D3D3',
      logo: {
        logoPath: '/assets/images/logo/emergency-info-bc.png',
        width: 174,
        height: 34
      },
      icon: {
        iconPath: '/assets/images/svg-icons/evacuation-order.svg',
        iconCircleColor: '#FDCECE',
      }
    },
    buttonArgs: {
      iconPath: '/assets/images/svg-icons/launch.svg',
      label: 'Evacuation Information',
      componentStyle: {
        backgroundColor: '#B91D38',
        labelColor: '#FFFFFF',
        iconColor: '#FFFFFF',
        border: 'none'
      }
    },
  },
};

export const evacuationInformationAlert: Story = {
  args: {
    title: 'Evacuation Information',
    message: 'Go to Emergency Info BC for up-to-date evacuation information.',
    componentStyle: {
      backgroundColor: '#FFFAEB',
      dividerColor: '#EEE8D3',
      outerBorderColor: '#F5E8BA',
      logo: {
        logoPath: '/assets/images/logo/emergency-info-bc.png',
        width: 174,
        height: 34
      },
      icon: {
        iconPath: '/assets/images/svg-icons/evacuation-alert.svg',
        iconCircleColor: '#FEEFBE',
      }
    },
    buttonArgs: {
      iconPath: '/assets/images/svg-icons/launch.svg',
      label: 'Evacuation Information',
      componentStyle: {
        backgroundColor: '#8F7100',
        labelColor: '#FFFFFF',
        iconColor: '#FFFFFF',
        border: 'none'
      }
    },
  },
};

export const areaRestriction: Story = {
  args: {
    title: 'Information Bulletin',
    message: 'View the bulletin on our website for more information.',
    componentStyle: {
      backgroundColor: '#F0F5FF',
      dividerColor: '#DBDFED',
      outerBorderColor: '#DBDFED',
      logo: {
        logoPath: '/assets/images/logo/bc-wildfire-service-logo-transparent.png',
        width: 274,
        height: 80
      },
      icon: {
        iconPath: '/assets/images/svg-icons/carbon_bullhorn-selected.svg',
        iconCircleColor: '#D9DEEE',
      }
    },
    buttonArgs: {
      label: 'Go to the Bulletin',
      iconPath: '/assets/images/svg-icons/link.svg',
      componentStyle: {
        backgroundColor: '#036',
        labelColor: '#FFFFFF',
        iconColor: '#FFFFFF',
        border: 'none'
      }
    },
  },
};
