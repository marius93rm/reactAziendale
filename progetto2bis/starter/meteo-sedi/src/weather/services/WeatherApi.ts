import type { Forecast, OfficeSite, TemperatureUnit } from '../weather.types';

export interface WeatherApi {
  getForecast(
    site: OfficeSite,
    unit: TemperatureUnit,
    signal: AbortSignal,
  ): Promise<Forecast>;
}
