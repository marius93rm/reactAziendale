import { WeatherDashboard } from './weather/components/WeatherDashboard';
import { createOpenMeteoWeatherApi } from './weather/services/createOpenMeteoWeatherApi';
import type { WeatherApi } from './weather/services/WeatherApi';
import { WeatherWorkspaceProvider } from './weather/state/WeatherWorkspaceContext';

const defaultWeatherApi = createOpenMeteoWeatherApi();

export function App({ api = defaultWeatherApi }: { api?: WeatherApi }) {
  return (
    <WeatherWorkspaceProvider>
      <WeatherDashboard api={api} />
    </WeatherWorkspaceProvider>
  );
}
