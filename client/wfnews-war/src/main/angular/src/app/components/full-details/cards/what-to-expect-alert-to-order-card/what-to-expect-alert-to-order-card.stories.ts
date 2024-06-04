import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { WhatToExpectAlertToOrderCardComponent } from './what-to-expect-alert-to-order-card.component';

const meta: Meta<WhatToExpectAlertToOrderCardComponent> = {
  title: 'Cards/WhatToExpectAlertToOrderCard',
  component: WhatToExpectAlertToOrderCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [
        WhatToExpectAlertToOrderCardComponent,
        ContentCardContainerComponent, 
        IconListItemComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<WhatToExpectAlertToOrderCardComponent>;

export const example: Story = {
};
