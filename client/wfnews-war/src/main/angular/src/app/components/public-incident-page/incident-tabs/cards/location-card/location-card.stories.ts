import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { LocationCardComponent } from './location-card.component';

const meta: Meta<LocationCardComponent> = {
  title: 'Cards/LocationCard',
  component: LocationCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [LocationCardComponent, ContentCardContainerComponent, WfnewsButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<LocationCardComponent>;

export const example: Story = {
  args: {
    traditionalTerritory: 'Tk’emlúps te Secépemc, Skwxwú7mesh Úxwumixw',
    description: 'This fire is approximately 83 km southeast of Tumbler Ridge and 125 km east of Dawson Creek.'
  }
};
