import { type Meta, type StoryObj } from '@storybook/angular';
import { AssignedResourceItemComponent } from './assigned-resource-item.component';

const meta: Meta<AssignedResourceItemComponent> = {
  title: 'Cards/ResourcesAssignedCard/AssignedResourceItem',
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
    headerText: 'Firefighting Personnel',
    description: 'There are currently 3 Initial Attack and 2 Unit Crews responding to this wildfire, as well as 20 military personnel.',
  }
};

export const heavyEquipment: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/heavy_equipment-mobile.svg',
    headerText: 'Heavy Equipment',
    description: 'There are currently 10 pieces of heavy equipment responding to this wildfire.',
  }
};

export const incidentManagementTeam: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/incident-management-teams-mobile.svg',
    headerText: 'Incident Management Team',
    description: 'The Incident Management Team is now in place for the North Peace Complex.',
  }
};

export const structureProtection: Story = {
  args: {
    iconPath: 'assets/images/svg-icons/structure-protection-mobile.svg',
    headerText: 'Structure Protection',
    description: 'Three Structure Protection teams have been deployed to the area.',
  }
};
