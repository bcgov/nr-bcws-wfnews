import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { IdentifyPanel } from './identify-panel.component';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { PointIdService } from '@app/services/point-id.service';

const mockPointIdService = {
    loadStationWeather: () => Promise.resolve(null),
};

const meta: Meta<IdentifyPanel>= {
    title: 'Components/IdentifyPanel',
    component: IdentifyPanel,
    decorators: [
        moduleMetadata({
            declarations: [IdentifyPanel],
            imports: [MatCardModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: PointIdService, useValue: mockPointIdService },
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IdentifyPanel>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        
    }
};


