/** Il test verifica il contratto più rischioso dell'Effect: annullare la richiesta. */
import { act, renderHook, waitFor } from '@testing-library/react';
import type { OperationsSnapshot } from '../dashboard.types';
import type { TimeRange } from '../dashboard.types';
import type { OperationsApi } from '../services/OperationsApi';
import { useOperationsData } from './useOperationsData';

const snapshot: OperationsSnapshot = {
  sites: [],
  alerts: [],
  updatedAt: '2026-07-23T08:30:00.000Z',
};

const snapshotWithData: OperationsSnapshot = {
  ...snapshot,
  sites: [
    {
      id: 'site-test',
      name: 'Sede Test',
      city: 'Torino',
      health: 'regolare',
      energyKwh: 420,
      occupancy: 68,
    },
  ],
};

describe('useOperationsData', () => {
  it('annulla la richiesta precedente quando cambia intervallo', async () => {
    const signals: AbortSignal[] = [];
    const api: OperationsApi = {
      getSnapshot: (_range, { signal }) => {
        signals.push(signal);
        return new Promise((resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Annullata', 'AbortError')),
            { once: true },
          );
          if (signals.length === 2) resolve(snapshot);
        });
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };

    const { rerender, result } = renderHook(
      ({ range }: { range: TimeRange }) => useOperationsData(api, range),
      { initialProps: { range: 'oggi' as TimeRange } },
    );

    rerender({ range: '7-giorni' });

    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current.status).toBe('empty'));
  });

  it('forza una nuova richiesta durante il refresh', async () => {
    const forces: boolean[] = [];
    const api: OperationsApi = {
      getSnapshot: async (_range, request) => {
        forces.push(Boolean(request.force));
        return snapshot;
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };
    const { result } = renderHook(() => useOperationsData(api, 'oggi'));
    await waitFor(() => expect(result.current.status).toBe('empty'));

    act(() => result.current.refresh());
    await waitFor(() => expect(forces).toHaveLength(2));
    expect(forces).toEqual([false, true]);
  });

  it('rimuove l\'errore e conserva i dati durante il retry', async () => {
    let resolveRetry!: (value: OperationsSnapshot) => void;
    let requestCount = 0;
    const api: OperationsApi = {
      getSnapshot: async () => {
        requestCount += 1;
        if (requestCount === 1) return snapshotWithData;
        if (requestCount === 2) throw new Error('Servizio non disponibile');
        return new Promise((resolve) => {
          resolveRetry = resolve;
        });
      },
      saveWidget: async (widget) => widget,
      invalidate: () => undefined,
    };
    const { result } = renderHook(() => useOperationsData(api, 'oggi'));
    await waitFor(() => expect(result.current.status).toBe('success'));

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => result.current.retry());
    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.error).toBeNull();
      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.data).toEqual(snapshotWithData);
    });

    await act(async () => resolveRetry(snapshotWithData));
    await waitFor(() => expect(result.current.isRefreshing).toBe(false));
  });
});
