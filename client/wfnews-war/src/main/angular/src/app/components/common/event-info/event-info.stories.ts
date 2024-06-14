import { CircleIconButtonComponent } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { EventInfoComponent } from './event-info.component';

const meta: Meta<EventInfoComponent> = {
  title: 'Components/EventInfo',
  component: EventInfoComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        EventInfoComponent, 
        IconListItemComponent, 
        CircleIconButtonComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<EventInfoComponent>;

export const example: Story = {
  args: {
    headerIconPath: 'assets/images/svg-icons/area-restriction.svg',
    headerText: 'Trumpeter Mountain Wildfire',
    fireCentreText: 'Southeast Fire Centre',
    issueDateText: 'Issued on June 4, 2023',
    componentStyle: {
      backgroundColor: '#F5F5F5',
      border: '2px solid #C4C4C4',
      dividerColor: '#DDD',
      circleButtonStyle: {
        backgroundColor: '#EEEEEE',
        border: 'none',
      }
    }
  },
};

export const alert: Story = {
  args: {
    headerIconPath: 'assets/images/svg-icons/evacuation-alert.svg',
    headerText: 'Evacuation Alert for Boundary Lake Wildfire',
    issueDateText: 'Issued on July 19, 2023 at 10:45 am PST',
    issueAuthorityText: 'Issued by Regional District of Fraser-Fort George',
    componentStyle: {
      backgroundColor: '#FCF3D4',
      border: '2px solid #F3D999',
      dividerColor: '#FBE3E3',
      circleButtonStyle: {
        backgroundColor: '#F2E8C4',
        border: 'none',
        iconColor: '#906E1B'
      }
    }
  },
};

export const order: Story = {
  args: {
    headerIconPath: 'assets/images/svg-icons/evacuation-order.svg',
    headerText: 'Evacuation Order for Boundary Lake Wildfire',
    fireCentreText: 'Southeast Fire Centre',
    issueDateText: 'Issued on June 4, 2023',
    componentStyle: {
      backgroundColor: '#FEF1F2',
      border: '2px solid #F4CFCF',
      dividerColor: '#EEE5C6',
      circleButtonStyle: {
        backgroundColor: '#FBE3E3',
        border: 'none',
        iconColor: '#852A2D'
      }
    }
  },
};
