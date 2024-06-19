import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { EventInfoComponent } from '@app/components/common/event-info/event-info.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { CircleIconButtonComponent } from '../../../../common/circle-icon-button/circle-icon-button.component';
import { AreaRestrictionsCardComponent } from './area-restrictions-card.component';

const meta: Meta<AreaRestrictionsCardComponent> = {
  title: 'Cards/AreaRestrictionsCard',
  component: AreaRestrictionsCardComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        AreaRestrictionsCardComponent,
        ContentCardContainerComponent,
        EventInfoComponent,
        CircleIconButtonComponent,
        IconListItemComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<AreaRestrictionsCardComponent>;

export const example: Story = {
  args: {
    areaRestrictions: [{
      protRsSysID: 22,
      name: 'K55405 Area Restriction',
      accessStatusEffectiveDate: new Date(),
      fireCentre: 'Kamloops Fire Centre',
      fireZone: 'Pentiction Fire Zone',
      bulletinUrl: null
    }]
  }
};

export const emptyState: Story = {
  args: {
    areaRestrictions: []
  }
};

export const exampleWithWarning: Story = {
  args: {
    areaRestrictions: [{
      protRsSysID: 22,
      name: 'K55405 Area Restriction',
      accessStatusEffectiveDate: new Date(),
      fireCentre: 'Kamloops Fire Centre',
      fireZone: 'Pentiction Fire Zone',
      bulletinUrl: null
    }],
    showPreviewWarning: true
  }
};

export const emptyStateWithWarning: Story = {
  args: {
    areaRestrictions: [],
    showPreviewWarning: true
  }
};
