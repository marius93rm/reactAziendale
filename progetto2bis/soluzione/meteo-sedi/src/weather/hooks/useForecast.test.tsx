import { act, renderHook, waitFor } from '@testing-library/react';
import { officeSites } from '../sites';
import type { WeatherApi } from '../services/WeatherApi';
import type { Forecast } from '../weather.types';
import { useForecast } from './useForecast';

const forecast: Forecast = {
  current: {
    observedAt: '2026-07-23T10:00',
    temperature: 24,
    apparentTemperature: 25,
    windSpeed: 10,
    weatherCode: 0,
  },
  daily: [
    { date: '2026-07-23', minimumTemperature: 18, maximumTemperature: 28, weatherCode: 0 },
  ],
};

describe('useForecast', () => {
  it('ignora una risposta obsoleta anche se l adapter non rispetta abort', async () => {
    const resolvers: Array<(value: Forecast) => void> = [];
    const api: WeatherApi = {
      getForecast: () => new Promise((resolve) => resolvers.push(resolve)),
    };
    const { result, rerender } = renderHook(
      ({ site }) => useForecast(api, site, 'celsius'),
      { initialProps: { site: officeSites[0] } },
    );
    await waitFor(() => expect(resolvers).toHaveLength(1));

    rerender({ site: officeSites[1] });
    await waitFor(() => expect(resolvers).toHaveLength(2));
    await act(async () => resolvers[1](forecast));
    expect(result.current.status).toBe('success');

    await act(async () =>
      resolvers[0]({
        ...forecast,
        current: { ...forecast.current, temperature: 99 },
      }),
    );
    expect(result.current.data?.current.temperature).toBe(24);
  });

  it('non trasforma AbortError in errore visibile', async () => {
    const api: WeatherApi = {
      getForecast: async () => {
        throw new DOMException('Annullata', 'AbortError');
      },
    };
    const { result } = renderHook(() => useForecast(api, officeSites[0], 'celsius'));

    await waitFor(() => expect(result.current.status).toBe('loading'));
    expect(result.current.error).toBeNull();
  });

  it('refresh genera una nuova richiesta', async () => {
    const getForecast = vi.fn(async () => forecast);
    const api: WeatherApi = { getForecast };
    const { result } = renderHook(() => useForecast(api, officeSites[0], 'celsius'));
    await waitFor(() => expect(result.current.status).toBe('success'));

    act(() => result.current.refresh());

    await waitFor(() => expect(getForecast).toHaveBeenCalledTimes(2));
  });
});
