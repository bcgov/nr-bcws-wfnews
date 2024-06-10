import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ContactUsBannerComponent } from './contact-us-banner.component';

const meta: Meta<ContactUsBannerComponent> = {
  title: 'Banners/ContactUsBanner',
  component: ContactUsBannerComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [ContactUsBannerComponent, IconListItemComponent, IconButtonComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<ContactUsBannerComponent>;

export const example: Story = {
  args: {
    incident: {
      fireCentreName: 'Prince George Fire Centre',
      contactEmailAddress: 'BCWS.NorthPeaceComplex.Info@gov.bc.ca',
      contactPhoneNumber: '778-362-4783'
    }
  }
};
