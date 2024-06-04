import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { AtTheReceptionCentreCardComponent } from './at-the-reception-centre-card.component';

const meta: Meta<AtTheReceptionCentreCardComponent> = {
  title: 'Cards/AtTheRecpetionCentreCard',
  component: AtTheReceptionCentreCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [AtTheReceptionCentreCardComponent, ContentCardContainerComponent, IconListItemComponent, WfnewsButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<AtTheReceptionCentreCardComponent>;

export const example: Story = {
};
