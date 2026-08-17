import { AssociatedWildfireCardComponent } from '@app/components/full-details/cards/associated-wildfire-card/associated-wildfire-card.component';
import { CircleIconButtonComponent } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconInfoChipComponent } from '@app/components/common/icon-info-chip/icon-info-chip.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { STAGE_OF_CONTROL_CODES } from '@app/constants';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { NearbyWildfiresCardComponent } from './nearby-wildfires-card.component';

const meta: Meta<NearbyWildfiresCardComponent> = {
  title: 'Cards/NearbyWildfiresCard',
  component: NearbyWildfiresCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        NearbyWildfiresCardComponent,
        AssociatedWildfireCardComponent,
        ContentCardContainerComponent,
        IconListItemComponent,
        IconInfoChipComponent,
        CircleIconButtonComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<NearbyWildfiresCardComponent>;

const incident1 = {
  incidentNumber: '12345',
  incidentName: 'Test Incident',
  stageOfControlCode: STAGE_OF_CONTROL_CODES.OUT_OF_CONTROL,
  discoveryDate: '2021-01-01T00:00:00Z',
  stageOfControlLabel: 'Out of Control',
  stageOfControlIcon: 'assets/images/svg-icons/out-of-control.svg',
  fireOfNoteInd: true,
  fireCentreName: 'Test Fire Centre',
  fireYear: '2021',
  incidentNumberLabel: '12345'
};

const incident2 = {
  incidentNumber: '67890',
  incidentName: 'Second Test Incident',
  stageOfControlCode: STAGE_OF_CONTROL_CODES.OUT,
  discoveryDate: '2021-02-15T00:00:00Z',
  stageOfControlLabel: 'Out',
  stageOfControlIcon: 'assets/images/svg-icons/out-of-control.svg',
  fireOfNoteInd: false,
  fireCentreName: 'Test Fire Centre',
  fireYear: '2021',
  incidentNumberLabel: '67890'
};

export const single: Story = {
  args: {
    incidents: [incident1],
    bookmarkedIncidentNumbers: []
  }
};

export const multiple: Story = {
  args: {
    incidents: [incident1, incident2],
    bookmarkedIncidentNumbers: []
  }
};

export const withBookmarked: Story = {
  args: {
    incidents: [incident1, incident2],
    bookmarkedIncidentNumbers: ['2021:12345']
  }
};

export const empty: Story = {
  args: {
    incidents: [],
    bookmarkedIncidentNumbers: []
  }
};