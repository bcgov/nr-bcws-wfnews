import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { HeaderTextCardComponent } from '../header-text-card/header-text-card.component';
import { IndustrialActivitiesCardComponent } from './industrial-activities-card.component';

const meta: Meta<IndustrialActivitiesCardComponent> = {
  title: 'Cards/IndustrialActivitiesCard',
  component: IndustrialActivitiesCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [IndustrialActivitiesCardComponent, ContentCardContainerComponent, HeaderTextCardComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<IndustrialActivitiesCardComponent>;

export const example: Story = {
};
