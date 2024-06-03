import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ContentCardContainerComponent } from '../content-card-container/content-card-container.component';
import { TwoColumnContentCardsContainerComponent } from './two-column-content-cards-container.component';

const meta: Meta<TwoColumnContentCardsContainerComponent> = {
  title: 'Containers/TwoColumnContentCardsContainer',
  component: TwoColumnContentCardsContainerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [TwoColumnContentCardsContainerComponent, ContentCardContainerComponent],
    }),
  
  ],
};

export default meta;
type Story = StoryObj<TwoColumnContentCardsContainerComponent>;

export const example: Story = {
  render: () => ({
    template: `
      <two-column-content-cards-container>
        <ng-container column-1> 
          <content-card-container> Column 1 A </content-card-container> 
          <content-card-container> Column 1 B </content-card-container>
          <content-card-container> Column 1 C </content-card-container>
        </ng-container>
        <ng-container column-2> 
          <content-card-container> Column 2 A </content-card-container> 
          <content-card-container> Column 2 B </content-card-container>
          <content-card-container> Column 2 C </content-card-container>
        </ng-container>
      </two-column-content-cards-container>
    `,
  }),
};
