import { officeSites } from '../sites';
import {
  buildForecastUrl,
  createOpenMeteoWeatherApi,
  mapOpenMeteoForecast,
} from './createOpenMeteoWeatherApi';

const payload = {
  current: {
    time: '2026-07-23T10:00',
    temperature_2m: 24.4,
    apparent_temperature: 25.1,
    weather_code: 1,
    wind_speed_10m: 11.6,
  },
  daily: {
    time: ['2026-07-23', '2026-07-24'],
    weather_code: [1, 61],
    temperature_2m_max: [28, 25],
    temperature_2m_min: [18, 16],
  },
};

describe('createOpenMeteoWeatherApi', () => {
  it('costruisce un URL con i soli campi usati e cinque giorni', () => {
    const url = new URL(buildForecastUrl(officeSites[0], 'fahrenheit'));

    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('45.4642');
    expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('current')).toBe(
      'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
    );
  });

  it('inoltra AbortSignal e trasforma la risposta', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => payload,
    } as Response));
    const controller = new AbortController();
    const api = createOpenMeteoWeatherApi(fetchImpl);

    const result = await api.getForecast(officeSites[0], 'celsius', controller.signal);

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('forecast_days=5'),
      { signal: controller.signal },
    );
    expect(result.current.temperature).toBe(24.4);
    expect(result.daily[1]).toEqual({
      date: '2026-07-24',
      minimumTemperature: 16,
      maximumTemperature: 25,
      weatherCode: 61,
    });
  });

  it('rifiuta risposte HTTP non riuscite', async () => {
    const api = createOpenMeteoWeatherApi(
      vi.fn(async () => ({ ok: false, status: 503 } as Response)),
    );

    await expect(
      api.getForecast(officeSites[0], 'celsius', new AbortController().signal),
    ).rejects.toThrow('Richiesta meteo non riuscita (503).');
  });

  it('rifiuta payload incompleti o serie disallineate', () => {
    expect(() => mapOpenMeteoForecast({ current: {}, daily: {} })).toThrow(
      'Serie meteo non valida: time.',
    );
    expect(() =>
      mapOpenMeteoForecast({
        ...payload,
        daily: { ...payload.daily, weather_code: [1] },
      }),
    ).toThrow('Le serie giornaliere hanno lunghezze diverse.');
  });

  it('rifiuta date giornaliere non valide prima del rendering', () => {
    expect(() =>
      mapOpenMeteoForecast({
        ...payload,
        daily: { ...payload.daily, time: ['non-data', '2026-07-24'] },
      }),
    ).toThrow('Serie meteo non valida: time.');

    expect(() =>
      mapOpenMeteoForecast({
        ...payload,
        daily: { ...payload.daily, time: ['2026-02-30', '2026-07-24'] },
      }),
    ).toThrow('Serie meteo non valida: time.');
  });

  it("accetta una serie giornaliera vuota per l'empty state", () => {
    const result = mapOpenMeteoForecast({
      ...payload,
      daily: {
        time: [],
        weather_code: [],
        temperature_2m_max: [],
        temperature_2m_min: [],
      },
    });

    expect(result.daily).toEqual([]);
  });
});
