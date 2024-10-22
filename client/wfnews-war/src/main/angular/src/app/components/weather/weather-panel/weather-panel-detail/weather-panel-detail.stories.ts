import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { WeatherPanelDetailComponent } from '@app/components/weather/weather-panel/weather-panel-detail/weather-panel-detail.component';

const meta: Meta<WeatherPanelDetailComponent> = {
    title: 'DesktopPreview/WeatherPanelDetailComponent',
  component: WeatherPanelDetailComponent,
  tags: ['autodocs'], 
  decorators: [
    moduleMetadata({
      declarations: [WeatherPanelDetailComponent]
    })
  ]
};

export default meta;
type Story = StoryObj<WeatherPanelDetailComponent>;

export const example: Story = {
    args: {
        hourly: {
            "index": 1,
            "temp": 13.7,
            "relativeHumidity": 46,
            "windSpeed": 6.9,
            "windDirection": 287,
            "windCardinalDir": "WNW",
            "precipitation": 0.0,
            "fineFuelMoistureCode": 85.711,
            "initialSpreadIndex": 3.292,
            "fireWeatherIndex": 5.605,
            "hour": "2024060609"
          },
          daily: {
            "index": 1,
            "temp": 16.5,
            "relativeHumidity": 37,
            "windSpeed": 7.1,
            "windDirection": 154,
            "windCardinalDir": "SSE",
            "precipitation": 0.2,
            "fineFuelMoistureCode": 71.168,
            "initialSpreadIndex": 0.93,
            "fireWeatherIndex": 0.882,
            "day": "20240605",
            "forecastInd": false,
            "buildupIndex": 21.47,
            "droughtCode": 201.933,
            "duffMoistureCode": 12.38
          },
          latitude: 51.0486,
          longitude: -114.0708,
          stationData: {
            stationName: 'TURTLE',
          },
      }
};
