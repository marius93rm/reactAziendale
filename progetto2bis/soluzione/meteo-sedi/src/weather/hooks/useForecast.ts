import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeatherApi } from '../services/WeatherApi';
import type {
  ForecastViewState,
  OfficeSite,
  TemperatureUnit,
} from '../weather.types';

const initialState: ForecastViewState = {
  status: 'idle',
  data: null,
  error: null,
};

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError')
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento.';
}

export function useForecast(
  api: WeatherApi,
  site: OfficeSite,
  unit: TemperatureUnit,
) {
  const [state, setState] = useState<ForecastViewState>(initialState);
  const [requestToken, setRequestToken] = useState(0);
  const latestRequestId = useRef(0);

  const requestAgain = useCallback(() => {
    setRequestToken((currentToken) => currentToken + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setState({ status: 'loading', data: null, error: null });

    void api
      .getForecast(site, unit, controller.signal)
      .then((forecast) => {
        if (controller.signal.aborted || requestId !== latestRequestId.current) return;
        setState(
          forecast.daily.length === 0
            ? { status: 'empty', data: null, error: null }
            : { status: 'success', data: forecast, error: null },
        );
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          requestId !== latestRequestId.current ||
          isAbortError(error)
        ) {
          return;
        }
        setState({ status: 'error', data: null, error: getErrorMessage(error) });
      });

    return () => {
      controller.abort();
    };
  }, [api, requestToken, site, unit]);

  return {
    ...state,
    retry: requestAgain,
    refresh: requestAgain,
  };
}
