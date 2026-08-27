import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ConnectWithLocalAuthoritiesCardComponent } from './connect-with-local-authorities-card.component';

const meta: Meta<ConnectWithLocalAuthoritiesCardComponent> = {
  title: 'Cards/ConnectWithLocalAuthoritiesCard',
  component: ConnectWithLocalAuthoritiesCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ConnectWithLocalAuthoritiesCardComponent, ContentCardContainerComponent, IconListItemComponent, WfnewsButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ConnectWithLocalAuthoritiesCardComponent>;

export const example: Story = {
  args: {
    localAuthority: 'Coastal Regional District'
  }
};
