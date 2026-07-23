/**
 * Questo modulo simula una API senza rete esterna.
 * L'AbortSignal permette alla UI di annullare una richiesta non più utile.
 */
import type {
  OperationsSnapshot,
  Site,
  TimeRange,
} from './dashboard.types';

const baseSites: Site[] = [
  {
    id: 'site-torino',
    name: 'Sede Torino',
    city: 'Torino',
    health: 'regolare',
    energyKwh: 684,
    occupancy: 72,
  },
  {
    id: 'site-bologna',
    name: 'Hub Bologna',
    city: 'Bologna',
    health: 'attenzione',
    energyKwh: 518,
    occupancy: 61,
  },
  {
    id: 'site-padova',
    name: 'Centro Padova',
    city: 'Padova',
    health: 'critica',
    energyKwh: 742,
    occupancy: 84,
  },
  {
    id: 'site-bari',
    name: 'Sede Bari',
    city: 'Bari',
    health: 'regolare',
    energyKwh: 431,
    occupancy: 48,
  },
];

const alerts = [
  {
    id: 'alert-ventilation',
    siteId: 'site-padova',
    title: 'Ventilazione sala server oltre soglia',
    severity: 'alta' as const,
  },
  {
    id: 'alert-access',
    siteId: 'site-bologna',
    title: 'Lettore accessi piano 2 intermittente',
    severity: 'media' as const,
  },
  {
    id: 'alert-energy',
    siteId: 'site-padova',
    title: 'Consumo fuori fascia nella notte',
    severity: 'media' as const,
  },
];

let failedOnce = false;

function abortError() {
  return new DOMException('Richiesta annullata', 'AbortError');
}

/** Restituisce dati diversi per intervallo, come farebbe un endpoint reale. */
export function fetchOperationsSnapshot(
  range: TimeRange,
  signal: AbortSignal,
): Promise<OperationsSnapshot> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };

    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      if (signal.aborted) {
        reject(abortError());
        return;
      }

      const scenario = new URLSearchParams(window.location.search).get(
        'scenario',
      );

      if (scenario === 'error-once' && !failedOnce) {
        failedOnce = true;
        reject(new Error('Il servizio operativo non risponde.'));
        return;
      }

      if (scenario === 'empty') {
        resolve({ sites: [], alerts: [], updatedAt: '2026-07-23T08:30:00.000Z' });
        return;
      }

      const multiplier =
        range === 'oggi' ? 1 : range === '7-giorni' ? 6.4 : 25.7;

      resolve({
        sites: baseSites.map((site) => ({
          ...site,
          energyKwh: Math.round(site.energyKwh * multiplier),
        })),
        alerts: alerts.map((alert) => ({ ...alert })),
        updatedAt: '2026-07-23T08:30:00.000Z',
      });
    }, 320);

    signal.addEventListener('abort', onAbort, { once: true });
  });
}
