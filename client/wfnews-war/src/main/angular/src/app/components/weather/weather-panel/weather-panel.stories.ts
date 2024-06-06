import { WeatherPanelComponent } from '@app/components/weather/weather-panel/weather-panel.component';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

const meta: Meta<WeatherPanelComponent> = {
    title: 'DesktopPreview/WeatherPanelComponent',
  component: WeatherPanelComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WeatherPanelComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WeatherPanelComponent>;

export const example: Story = {
    args: {
      stationData: {
        stationName: 'AFTON',
        latitude: 51.0486,
        longitude: -114.0708,
      },
      hourly: {
        temp: 9.8,
        relativeHumidity: 100,
        windSpeed: 2.4,
        windDirection: 36,
        windCardinalDir: 'N',
        precipitation: 0,
        fineFuelMoistureCode: 42,
        initialSpreadIndex: 1,
        fireWeatherIndex: 2,
        hour: '2024060421',
      },
      daily: {
        day: '20240604',
        temp: 17.2,
        relativeHumidity: 72,
        windSpeed: 9,
        windDirection: 143,
        windCardinalDir: 'SE',
        precipitation: 0,
        fineFuelMoistureCode: 42,
        initialSpreadIndex: 1,
        fireWeatherIndex: 2,
        droughtCode: 18,
        buildupIndex: 9,
        duffMoistureCode: 9,
      },
      latitude: 51.0486,
      longitude: -114.0708
    }
};
