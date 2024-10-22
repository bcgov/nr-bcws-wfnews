import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AssignedResourceItemComponent } from '../response-type-card/assigned-resource-item/assigned-resource-item.component';
import { ResourcesAssignedCardComponent } from './resources-assigned-card.component';

const meta: Meta<ResourcesAssignedCardComponent> = {
  title: 'Cards/ResourcesAssignedCard/ResourceAssignedCard',
  component: ResourcesAssignedCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [ResourcesAssignedCardComponent, ContentCardContainerComponent, AssignedResourceItemComponent, IconButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ResourcesAssignedCardComponent>;

export const example: Story = {
  args: {
    resources: [{
      headerText: 'Incident Management Team',
      iconPath: 'assets/images/svg-icons/incident-management-teams-mobile.svg',
      description: 'The Incident Management Team is now in place for the North Peace Complex.'
    }, {
      headerText: 'Firefighting Personnel',
      iconPath: 'assets/images/svg-icons/wildfire-crews-mobile.svg',
      description: 'There are currently 3 Initial Attack and 2 Unit Crews responding to this wildfire, as well as 20 military personnel.'
    }, {
      headerText: 'Aviation',
      iconPath: 'assets/images/svg-icons/aviation-mobile.svg',
      description: 'There are currently 9 helicopters and 0 airtankers responding to this wildfire.'
    }, {
      headerText: 'Heavy Equipment',
      iconPath: 'assets/images/svg-icons/heavy_equipment-mobile.svg',
      description: 'There are currently 10 pieces of heavy equipment responding to this wildfire.'
    }, {
      headerText: 'Structure Protection',
      iconPath: 'assets/images/svg-icons/structure-protection-mobile.svg',
      description: 'Three Structure Protection teams have been deployed to the area.'
    }],
  }
};
