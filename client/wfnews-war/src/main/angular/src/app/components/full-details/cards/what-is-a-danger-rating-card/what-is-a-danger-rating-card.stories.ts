import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from '../header-text-card/header-text-card.component';
import { WhatIsADangerRatingCardComponent } from './what-is-a-danger-rating-card.component';

const meta: Meta<WhatIsADangerRatingCardComponent> = {
  title: 'Cards/WhatIsADangerRatingCard',
  component: WhatIsADangerRatingCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WhatIsADangerRatingCardComponent, ContentCardContainerComponent, HeaderTextCardComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WhatIsADangerRatingCardComponent>;

export const example: Story = {
};
