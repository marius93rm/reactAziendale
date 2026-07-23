import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { App } from './App';
import { appTheme } from './theme';
import type { WeatherApi } from './weather/services/WeatherApi';
import type { Forecast } from './weather/weather.types';

const forecast: Forecast = {
  current: {
    observedAt: '2026-07-23T10:00',
    temperature: 24.4,
    apparentTemperature: 25.1,
    windSpeed: 11.6,
    weatherCode: 1,
  },
  daily: [
    { date: '2026-07-23', minimumTemperature: 18, maximumTemperature: 28, weatherCode: 85 },
    { date: '2026-07-24', minimumTemperature: 19, maximumTemperature: 29, weatherCode: 86 },
    { date: '2026-07-25', minimumTemperature: 17, maximumTemperature: 26, weatherCode: 95 },
    { date: '2026-07-26', minimumTemperature: 16, maximumTemperature: 25, weatherCode: 99 },
    { date: '2026-07-27', minimumTemperature: 18, maximumTemperature: 27, weatherCode: 0 },
  ],
};

function createApi(getForecast: WeatherApi['getForecast'] = async () => forecast): WeatherApi {
  return { getForecast };
}

function renderApp(api = createApi()) {
  return render(
    <ThemeProvider theme={appTheme}>
      <App api={api} />
    </ThemeProvider>,
  );
}

describe('Meteo sedi soluzione', () => {
  it('carica condizioni attuali e cinque giorni tramite una API iniettata', async () => {
    renderApp();

    expect(screen.getByRole('status', { name: 'Caricamento dati meteo' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Condizioni attuali' })).toBeInTheDocument();
    expect(screen.getByText('24 °C')).toBeInTheDocument();
    expect(screen.getByText('Codice WMO 1')).toBeInTheDocument();
    expect(screen.getByText('11.6 km/h')).toBeInTheDocument();
    const fiveDays = screen.getByRole('region', { name: 'Previsione a cinque giorni' });
    expect(within(fiveDays).getAllByRole('heading', { level: 3 })).toHaveLength(5);
    expect(within(fiveDays).getAllByText('Rovesci di neve')).toHaveLength(2);
    expect(within(fiveDays).getAllByText('Temporale')).toHaveLength(2);
  });

  it('annulla la richiesta precedente quando cambia sede o unità', async () => {
    const signals: AbortSignal[] = [];
    const resolvers: Array<(value: Forecast) => void> = [];
    const api = createApi((_site, _unit, signal) => {
      signals.push(signal);
      return new Promise((resolve) => resolvers.push(resolve));
    });
    const user = userEvent.setup();
    renderApp(api);
    await waitFor(() => expect(signals).toHaveLength(1));

    await user.click(screen.getByRole('button', { name: 'Torino' }));

    await waitFor(() => expect(signals).toHaveLength(2));
    expect(signals[0].aborted).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    await waitFor(() => expect(signals).toHaveLength(3));
    expect(signals[1].aborted).toBe(true);
    await act(async () => resolvers[2](forecast));
    expect(await screen.findByText('24 °F')).toBeInTheDocument();
    await act(async () => resolvers[0](forecast));
    await act(async () => resolvers[1](forecast));
  });

  it('persiste sede e unità valide', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByText('24 °C');

    await user.click(screen.getByRole('button', { name: 'Bari' }));
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    await waitFor(() => {
      const saved = window.localStorage.getItem(
        'react-aziendale:meteo-sedi:preferences:v1',
      );
      expect(saved).toContain('bari');
      expect(saved).toContain('fahrenheit');
    });
  });

  it('recupera da un errore tramite retry', async () => {
    let requests = 0;
    const api = createApi(async () => {
      requests += 1;
      if (requests === 1) throw new Error('Servizio meteo non disponibile.');
      return forecast;
    });
    const user = userEvent.setup();
    renderApp(api);
    expect(await screen.findByText('Servizio meteo non disponibile.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Riprova' }));

    expect(await screen.findByText('24 °C')).toBeInTheDocument();
    expect(requests).toBe(2);
  });

  it('mostra un empty state controllato', async () => {
    renderApp(createApi(async () => ({ ...forecast, daily: [] })));

    expect(
      await screen.findByRole('heading', { name: 'Nessuna previsione disponibile' }),
    ).toBeInTheDocument();
  });

  it('espone landmark e attribuzione accessibili', async () => {
    renderApp();
    await screen.findByText('24 °C');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Scegli sede' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Unità di temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
  });
});
