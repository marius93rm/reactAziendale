import type { WeatherApi } from './WeatherApi';

/**
 * L'adapter mantiene la firma finale ma non esegue richieste nello starter.
 * Il brief guida la costruzione dell'URL, fetch e mapping del payload.
 */
export function createOpenMeteoWeatherApi(
  fetchImpl: typeof fetch = globalThis.fetch,
): WeatherApi {
  return {
    async getForecast(site, unit, signal) {
      // TODO 5: costruire l'URL Open-Meteo dai parametri ricevuti.
      // TODO 6: chiamare fetchImpl, verificare response.ok e inoltrare signal.
      // TODO 7: validare e trasformare il payload nel tipo Forecast.
      void fetchImpl;
      void site;
      void unit;
      void signal;
      throw new Error('API meteo non ancora implementata.');
    },
  };
}
