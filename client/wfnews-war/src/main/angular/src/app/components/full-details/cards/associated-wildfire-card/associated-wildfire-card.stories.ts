import { CircleIconButtonComponent } from '@app/components/common/circle-icon-button/circle-icon-button.component';
import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconInfoChipComponent } from '@app/components/common/icon-info-chip/icon-info-chip.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { STAGE_OF_CONTROL_CODES } from '@app/constants';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AssociatedWildfireCardComponent } from './associated-wildfire-card.component';

const meta: Meta<AssociatedWildfireCardComponent> = {
  title: 'Cards/AssociatedWildfireCard',
  component: AssociatedWildfireCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
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
type Story = StoryObj<AssociatedWildfireCardComponent>;

export const example: Story = {
  args: {
    incident: {
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
    },
    isBookmarked: false
  }
};

export const out: Story = {
  args: {
    incident: {
      incidentNumber: '12345',
      incidentName: 'Test Incident',
      stageOfControlCode: STAGE_OF_CONTROL_CODES.OUT,
      discoveryDate: '2021-01-01T00:00:00Z',
      stageOfControlLabel: 'Out',
      stageOfControlIcon: 'assets/images/svg-icons/out-of-control.svg',
      fireOfNoteInd: true,
      fireCentreName: 'Test Fire Centre',
      fireYear: '2021',
      incidentNumberLabel: '12345'
    },
    isBookmarked: false
  }
};

export const bookmarked: Story = {
  args: {
    incident: {
      incidentNumber: '12345',
      incidentName: 'Test Incident',
      stageOfControlCode: STAGE_OF_CONTROL_CODES.OUT,
      discoveryDate: '2021-01-01T00:00:00Z',
      stageOfControlLabel: 'Out',
      stageOfControlIcon: 'assets/images/svg-icons/out-of-control.svg',
      fireOfNoteInd: true,
      fireCentreName: 'Test Fire Centre',
      fireYear: '2021',
      incidentNumberLabel: '12345'
    },
    isBookmarked: true
  }
};

export const notFireOfNote: Story = {
  args: {
    incident: {
      incidentNumber: '12345',
      incidentName: 'Test Incident',
      stageOfControlCode: STAGE_OF_CONTROL_CODES.OUT,
      discoveryDate: '2021-01-01T00:00:00Z',
      stageOfControlLabel: 'Out',
      stageOfControlIcon: 'assets/images/svg-icons/out-of-control.svg',
      fireOfNoteInd: false,
      fireCentreName: 'Test Fire Centre',
      fireYear: '2021',
      incidentNumberLabel: '12345'
    },
    isBookmarked: false
  }
};
