import { type Meta, type StoryObj } from '@storybook/angular';
import { AssignedResourceItemComponent } from './assigned-resource-item.component';

const meta: Meta<AssignedResourceItemComponent> = {
  title: 'Component/AssignedResourceItemComponent',
  component: AssignedResourceItemComponent,
  tags: ['autodocs'], 
};

export default meta;
type Story = StoryObj<AssignedResourceItemComponent>;

export const aviation: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/aviation-mobile.svg',
    headerText: 'Aviation',
    description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.',
  }
};

export const crews: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/wildfire-crews-mobile.svg',
    headerText: 'Wildfire Crews',
    description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.',
  }
};

export const heavyEquipment: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/heavy_equipment-mobile.svg',
    headerText: 'Heavy Equipment',
    description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.',
  }
};

export const incidentManagementTeam: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/incident-management-teams-mobile.svg',
    headerText: 'Incident Management Teams',
    description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.',
  }
};

export const structureProtection: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/structure-protection-mobile.svg',
    headerText: 'Structure Protection',
    description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.',
  }
};
