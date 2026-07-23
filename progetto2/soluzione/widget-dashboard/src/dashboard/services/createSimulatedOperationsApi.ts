/**
 * La API simulata offre cache TTL, abort e fallimenti ripetibili.
 * Il resto dell'app dipende dal contratto OperationsApi, non dalle fixture.
 */
import type { OperationsSnapshot, TimeRange } from '../dashboard.types';
import type { OperationsApi } from './OperationsApi';
import { alertFixtures, siteFixtures } from './operations.fixture';

type ApiOptions = {
  latencyMs?: number;
  cacheTtlMs?: number;
  scenario?: string | null;
  now?: () => number;
};

type CacheEntry = {
  snapshot: OperationsSnapshot;
  cachedAt: number;
};

function cloneSnapshot(snapshot: OperationsSnapshot): OperationsSnapshot {
  return {
    sites: snapshot.sites.map((site) => ({ ...site })),
    alerts: snapshot.alerts.map((alert) => ({ ...alert })),
    updatedAt: snapshot.updatedAt,
  };
}

function abortError() {
  return new DOMException('Richiesta annullata', 'AbortError');
}

function wait(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function buildSnapshot(range: TimeRange): OperationsSnapshot {
  const multiplier = range === 'oggi' ? 1 : range === '7-giorni' ? 6.4 : 25.7;
  return {
    sites: siteFixtures.map((site) => ({
      ...site,
      energyKwh: Math.round(site.energyKwh * multiplier),
    })),
    alerts: alertFixtures.map((alert) => ({ ...alert })),
    updatedAt: '2026-07-23T08:30:00.000Z',
  };
}

export function createSimulatedOperationsApi({
  latencyMs = 350,
  cacheTtlMs = 30_000,
  scenario = new URLSearchParams(window.location.search).get('scenario'),
  now = Date.now,
}: ApiOptions = {}): OperationsApi {
  const cache = new Map<TimeRange, CacheEntry>();
  let readFailed = false;
  let saveFailed = false;

  return {
    async getSnapshot(range, { signal, force = false }) {
      const cached = cache.get(range);
      if (!force && cached && now() - cached.cachedAt < cacheTtlMs) {
        return cloneSnapshot(cached.snapshot);
      }

      await wait(latencyMs, signal);

      if (scenario === 'error-once' && !readFailed) {
        readFailed = true;
        throw new Error('Il servizio operativo non risponde.');
      }

      const snapshot =
        scenario === 'empty'
          ? { sites: [], alerts: [], updatedAt: '2026-07-23T08:30:00.000Z' }
          : buildSnapshot(range);

      cache.set(range, { snapshot: cloneSnapshot(snapshot), cachedAt: now() });
      return cloneSnapshot(snapshot);
    },

    async saveWidget(widget, signal) {
      await wait(latencyMs, signal);

      const titleRequestsRollback = widget.title
        .toLocaleLowerCase('it-IT')
        .includes('rollback');
      if (
        titleRequestsRollback ||
        (scenario === 'save-error-once' && !saveFailed)
      ) {
        saveFailed = true;
        throw new Error('Il backend ha rifiutato la modifica del widget.');
      }

      return { ...widget };
    },

    invalidate(range) {
      if (range) cache.delete(range);
      else cache.clear();
    },
  };
}
