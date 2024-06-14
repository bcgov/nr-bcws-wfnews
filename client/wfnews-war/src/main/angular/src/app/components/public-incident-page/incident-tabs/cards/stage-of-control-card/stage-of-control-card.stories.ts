import { ContentCardContainerComponent } from '@app/components/common/content-card-container/content-card-container.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { StageOfControlCardComponent } from './stage-of-control-card.component';

const meta: Meta<StageOfControlCardComponent> = {
  title: 'Cards/StageOfControlCard',
  component: StageOfControlCardComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [StageOfControlCardComponent, ContentCardContainerComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<StageOfControlCardComponent>;

export const outOfControl: Story = {
  args: {
    stageOfControlCode: 'OUT_CNTRL'
  }
};

export const held: Story = {
  args: {
    stageOfControlCode: 'HOLDING'
  }
};

export const underControl: Story = {
  args: {
    stageOfControlCode: 'UNDR_CNTRL'
  }
};

export const out: Story = {
  args: {
    stageOfControlCode: 'OUT'
  }
};

export const wofOutOfControl: Story = {
  args: {
    isFireOfNote: true,
    stageOfControlCode: 'OUT_CNTRL'
  }
};

export const wofHeld: Story = {
  args: {
    isFireOfNote: true,
    stageOfControlCode: 'HOLDING'
  }
};

export const wofUnderControl: Story = {
  args: {
    isFireOfNote: true,
    stageOfControlCode: 'UNDR_CNTRL'
  }
};

export const wofOut: Story = {
  args: {
    isFireOfNote: true,
    stageOfControlCode: 'OUT'
  }
};
