/**
 * Questo hook possiede il server state e sincronizza la query tramite Effect.
 * AbortController impedisce a una risposta obsoleta di aggiornare la UI.
 */
import { useEffect, useRef, useState } from 'react';
import type {
  OperationsLoadState,
  TimeRange,
} from '../dashboard.types';
import type { OperationsApi } from '../services/OperationsApi';

const initialState: OperationsLoadState = {
  status: 'idle',
  data: null,
  error: null,
  isRefreshing: false,
};

export function useOperationsData(api: OperationsApi, range: TimeRange) {
  const [state, setState] = useState<OperationsLoadState>(initialState);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const handledRefreshVersion = useRef(0);
  const previousRange = useRef(range);

  useEffect(() => {
    const controller = new AbortController();
    const force = refreshVersion !== handledRefreshVersion.current;
    const rangeChanged = previousRange.current !== range;
    handledRefreshVersion.current = refreshVersion;
    previousRange.current = range;

    setState((current) => ({
      status:
        current.data && !rangeChanged
          ? current.data.sites.length === 0
            ? 'empty'
            : 'success'
          : 'loading',
      data: rangeChanged ? null : current.data,
      error: null,
      isRefreshing: Boolean(current.data && !rangeChanged),
    }));

    api
      .getSnapshot(range, { signal: controller.signal, force })
      .then((data) => {
        setState({
          status: data.sites.length === 0 ? 'empty' : 'success',
          data,
          error: null,
          isRefreshing: false,
        });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') {
          return;
        }
        setState((current) => ({
          ...current,
          status: 'error',
          error:
            reason instanceof Error
              ? reason.message
              : 'Errore imprevisto durante il caricamento.',
          isRefreshing: false,
        }));
      });

    return () => controller.abort();
  }, [api, range, refreshVersion]);

  function refresh() {
    api.invalidate(range);
    setRefreshVersion((value) => value + 1);
  }

  return { ...state, refresh, retry: refresh };
}
