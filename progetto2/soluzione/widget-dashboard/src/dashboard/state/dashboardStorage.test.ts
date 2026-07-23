/** I test proteggono schema, fallback e layout vuoto nello storage. */
import type { DashboardState } from '../dashboard.types';
import {
  createInitialDashboardState,
  dashboardStorageKey,
  initialWidgets,
  persistDashboardState,
} from './dashboardStorage';

describe('dashboardStorage', () => {
  it('conserva un layout vuoto valido', () => {
    window.localStorage.setItem(
      dashboardStorageKey,
      JSON.stringify({ version: 1, range: '7-giorni', widgets: [] }),
    );

    expect(createInitialDashboardState()).toMatchObject({
      range: '7-giorni',
      widgets: [],
    });
  });

  it('usa il fallback per id duplicati o vuoti', () => {
    window.localStorage.setItem(
      dashboardStorageKey,
      JSON.stringify({
        version: 1,
        range: 'oggi',
        widgets: [
          { id: 'duplicato', title: 'Primo', kind: 'alerts', size: 'compact' },
          { id: 'duplicato', title: 'Secondo', kind: 'sites', size: 'wide' },
        ],
      }),
    );

    expect(createInitialDashboardState().widgets).toEqual(initialWidgets);
  });

  it('salva soltanto lo schema persistente', () => {
    const state: DashboardState = {
      widgets: [],
      range: '30-giorni',
      pendingWidgetIds: ['widget-pending'],
      notice: { severity: 'error', message: 'Errore temporaneo' },
    };

    persistDashboardState(state);

    expect(JSON.parse(window.localStorage.getItem(dashboardStorageKey)!)).toEqual({
      version: 1,
      range: '30-giorni',
      widgets: [],
    });
  });
});
