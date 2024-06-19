import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { SuspectedCauseCardComponent } from './suspected-cause-card.component';

const meta: Meta<SuspectedCauseCardComponent> = {
  title: 'Cards/SuspectedCauseCard',
  component: SuspectedCauseCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [SuspectedCauseCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<SuspectedCauseCardComponent>;

export const human: Story = {
  args: {
    incidentSuspectedCauseCatId: 1
  }
};

export const lightning: Story = {
  args: {
    incidentSuspectedCauseCatId: 2
  }
};

export const underInvestigation: Story = {
  args: {
    incidentSuspectedCauseCatId: 3
  }
};

export const unknown: Story = {
  args: {
    incidentSuspectedCauseCatId: 0
  }
};
