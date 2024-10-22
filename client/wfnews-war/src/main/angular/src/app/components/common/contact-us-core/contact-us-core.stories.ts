import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ContactUsCoreComponent } from './contact-us-core.component';

const meta: Meta<ContactUsCoreComponent> = {
  title: 'Common/ContactUsCore',
  component: ContactUsCoreComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ContactUsCoreComponent, ContentCardContainerComponent, IconListItemComponent, IconButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ContactUsCoreComponent>;

export const example: Story = {
  args: {
    incident: {
      fireCentreName: 'Prince George Fire Centre',
      contactEmailAddress: 'BCWS.NorthPeaceComplex.Info@gov.bc.ca',
      contactPhoneNumber: '778-362-4783'
    }
  }
};
