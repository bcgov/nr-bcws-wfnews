import { ContactUsCoreComponent } from '@app/components/common/contact-us-core/contact-us-core.component';
import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ContactUsCardComponent } from './contact-us-card.component';

const meta: Meta<ContactUsCardComponent> = {
  title: 'Cards/ContactUsCard',
  component: ContactUsCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [
        ContactUsCardComponent, 
        ContactUsCoreComponent, 
        ContentCardContainerComponent, 
        IconListItemComponent, 
        IconButtonComponent
      ]
    })
  ]
};

export default meta;
type Story = StoryObj<ContactUsCardComponent>;

export const example: Story = {
  args: {
    incident: {
      fireCentreName: 'Prince George Fire Centre',
      contactEmailAddress: 'BCWS.NorthPeaceComplex.Info@gov.bc.ca',
      contactPhoneNumber: '778-362-4783'
    }
  }
};
