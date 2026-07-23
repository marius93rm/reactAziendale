import type { Forecast, OfficeSite, TemperatureUnit } from '../weather.types';
import type { WeatherApi } from './WeatherApi';

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readFiniteNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Campo meteo non valido: ${key}.`);
  }
  return value;
}

function readIsoDateTime(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value) ||
    !isIsoDate(value.slice(0, 10)) ||
    Number.isNaN(Date.parse(`${value}Z`))
  ) {
    throw new Error(`Campo meteo non valido: ${key}.`);
  }
  return value;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

function readNumberArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    !value.every(
      (item) => typeof item === 'number' && Number.isFinite(item),
    )
  ) {
    throw new Error(`Serie meteo non valida: ${key}.`);
  }
  return value as number[];
}

function readIsoDateArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (!Array.isArray(value) || !value.every(isIsoDate)) {
    throw new Error(`Serie meteo non valida: ${key}.`);
  }
  return value as string[];
}

export function buildForecastUrl(
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const searchParams = new URLSearchParams({
    latitude: String(site.latitude),
    longitude: String(site.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    temperature_unit: unit,
    wind_speed_unit: 'kmh',
    timezone: 'auto',
    forecast_days: '5',
  });

  return `${forecastEndpoint}?${searchParams.toString()}`;
}

/** Valida il payload esterno prima di farlo entrare nel dominio dell'app. */
export function mapOpenMeteoForecast(payload: unknown): Forecast {
  if (
    !isRecord(payload) ||
    !isRecord(payload.current) ||
    !isRecord(payload.daily)
  ) {
    throw new Error('Risposta meteo incompleta.');
  }

  const dates = readIsoDateArray(payload.daily, 'time');
  const weatherCodes = readNumberArray(payload.daily, 'weather_code');
  const maximumTemperatures = readNumberArray(
    payload.daily,
    'temperature_2m_max',
  );
  const minimumTemperatures = readNumberArray(
    payload.daily,
    'temperature_2m_min',
  );
  const seriesLengths = new Set([
    dates.length,
    weatherCodes.length,
    maximumTemperatures.length,
    minimumTemperatures.length,
  ]);

  if (seriesLengths.size !== 1) {
    throw new Error('Le serie giornaliere hanno lunghezze diverse.');
  }

  return {
    current: {
      observedAt: readIsoDateTime(payload.current, 'time'),
      temperature: readFiniteNumber(payload.current, 'temperature_2m'),
      apparentTemperature: readFiniteNumber(
        payload.current,
        'apparent_temperature',
      ),
      windSpeed: readFiniteNumber(payload.current, 'wind_speed_10m'),
      weatherCode: readFiniteNumber(payload.current, 'weather_code'),
    },
    daily: dates.slice(0, 5).map((date, index) => ({
      date,
      minimumTemperature: minimumTemperatures[index],
      maximumTemperature: maximumTemperatures[index],
      weatherCode: weatherCodes[index],
    })),
  };
}

export function createOpenMeteoWeatherApi(
  fetchImpl: typeof fetch = globalThis.fetch,
): WeatherApi {
  return {
    async getForecast(site, unit, signal) {
      const response = await fetchImpl(buildForecastUrl(site, unit), { signal });
      if (!response.ok) {
        throw new Error(`Richiesta meteo non riuscita (${response.status}).`);
      }
      const payload: unknown = await response.json();
      return mapOpenMeteoForecast(payload);
    },
  };
}
