import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { GetPreparedCardComponent } from './get-prepared-card.component';

const meta: Meta<GetPreparedCardComponent> = {
  title: 'Cards/GetPreparedCard',
  component: GetPreparedCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [
        GetPreparedCardComponent,
        ContentCardContainerComponent, 
        IconListItemComponent, 
        WfnewsButtonComponent, 
        IconButtonComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<GetPreparedCardComponent>;

export const example: Story = {
};
