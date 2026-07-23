import type { WeatherApi } from '../services/WeatherApi';
import type {
  ForecastViewState,
  OfficeSite,
  TemperatureUnit,
} from '../weather.types';

const idleState: ForecastViewState = {
  status: 'idle',
  data: null,
  error: null,
};

const pendingAction = () => undefined;

/** Lo starter resta idle finché lo studente non implementa l'Effect. */
export function useForecast(
  api: WeatherApi,
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  // TODO 8: sincronizzare sede e unità con la API tramite useEffect e cleanup.
  // TODO 9: modellare loading, success, empty, error, retry e refresh.
  void api;
  void site;
  void unit;

  return {
    ...idleState,
    retry: pendingAction,
    refresh: pendingAction,
  };
}

