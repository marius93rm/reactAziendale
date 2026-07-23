export type TemperatureUnit = 'celsius' | 'fahrenheit';

export type OfficeSite = {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
};

export type CurrentWeather = {
  observedAt: string;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  weatherCode: number;
};

export type DailyForecast = {
  date: string;
  minimumTemperature: number;
  maximumTemperature: number;
  weatherCode: number;
};

export type Forecast = {
  current: CurrentWeather;
  daily: DailyForecast[];
};

export type ForecastViewState =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: Forecast; error: null }
  | { status: 'empty'; data: null; error: null }
  | { status: 'error'; data: null; error: string };
