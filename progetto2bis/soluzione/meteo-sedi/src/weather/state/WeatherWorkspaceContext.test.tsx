import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import {
  preferencesStorageKey,
  readPreferences,
  useWeatherWorkspace,
  WeatherWorkspaceProvider,
} from './WeatherWorkspaceContext';

function Consumer() {
  const workspace = useWeatherWorkspace();
  return (
    <div>
      <output>{workspace.selectedSite.city}</output>
      <output>{workspace.temperatureUnit}</output>
      <button onClick={() => workspace.selectSite('torino')}>Torino</button>
      <button onClick={() => workspace.setTemperatureUnit('fahrenheit')}>Fahrenheit</button>
    </div>
  );
}

describe('WeatherWorkspaceContext', () => {
  it('aggiorna i consumer e persiste le preferenze', async () => {
    const user = userEvent.setup();
    render(
      <WeatherWorkspaceProvider>
        <Consumer />
      </WeatherWorkspaceProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Torino' }));
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('Torino', { selector: 'output' })).toBeInTheDocument();
    expect(screen.getByText('fahrenheit')).toBeInTheDocument();
    expect(window.localStorage.getItem(preferencesStorageKey)).toContain('torino');
  });

  it('usa i default con storage corrotto o preferenze sconosciute', () => {
    window.localStorage.setItem(preferencesStorageKey, '{');
    expect(readPreferences()).toEqual({
      selectedSiteId: 'milano',
      temperatureUnit: 'celsius',
    });

    window.localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({ selectedSiteId: 'roma', temperatureUnit: 'kelvin' }),
    );
    expect(readPreferences()).toEqual({
      selectedSiteId: 'milano',
      temperatureUnit: 'celsius',
    });
  });

  it('segnala l uso fuori dal Provider', () => {
    expect(() => renderHook(() => useWeatherWorkspace())).toThrow(
      'useWeatherWorkspace richiede WeatherWorkspaceProvider.',
    );
  });

  it('legge preferenze valide durante l inizializzazione', () => {
    window.localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({ selectedSiteId: 'bologna', temperatureUnit: 'fahrenheit' }),
    );
    const wrapper = ({ children }: { children: ReactNode }) => (
      <WeatherWorkspaceProvider>{children}</WeatherWorkspaceProvider>
    );
    const { result } = renderHook(() => useWeatherWorkspace(), { wrapper });

    expect(result.current.selectedSite.city).toBe('Bologna');
    expect(result.current.temperatureUnit).toBe('fahrenheit');
  });
});
