/** Lo storage salva soltanto configurazione persistente e valida il payload. */
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';

export const dashboardStorageKey = 'react-aziendale:widget-dashboard:v1';

export const initialWidgets: DashboardWidget[] = [
  { id: 'widget-alerts', title: 'Criticità aperte', kind: 'alerts', size: 'compact' },
  { id: 'widget-sites', title: 'Stato delle sedi', kind: 'sites', size: 'wide' },
  { id: 'widget-energy', title: 'Consumi energetici', kind: 'energy', size: 'wide' },
  { id: 'widget-occupancy', title: 'Occupazione media', kind: 'occupancy', size: 'compact' },
];

type PersistedDashboard = {
  version: 1;
  range: TimeRange;
  widgets: DashboardWidget[];
};

function isTimeRange(value: unknown): value is TimeRange {
  return ['oggi', '7-giorni', '30-giorni'].includes(String(value));
}

function isWidget(value: unknown): value is DashboardWidget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    'title' in value &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    'kind' in value &&
    ['alerts', 'sites', 'energy', 'occupancy'].includes(String(value.kind)) &&
    'size' in value &&
    ['compact', 'wide'].includes(String(value.size))
  );
}

function isPersistedDashboard(value: unknown): value is PersistedDashboard {
  if (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 1 &&
    'range' in value &&
    isTimeRange(value.range) &&
    'widgets' in value &&
    Array.isArray(value.widgets) &&
    value.widgets.every(isWidget)
  ) {
    const ids = value.widgets.map((widget) => widget.id);
    return new Set(ids).size === ids.length;
  }

  return false;
}

export function createInitialDashboardState(): DashboardState {
  const fallback: DashboardState = {
    widgets: initialWidgets.map((widget) => ({ ...widget })),
    range: 'oggi',
    pendingWidgetIds: [],
    notice: null,
  };

  try {
    const raw = window.localStorage.getItem(dashboardStorageKey);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedDashboard(parsed)) return fallback;

    return {
      ...fallback,
      range: parsed.range,
      widgets: parsed.widgets.map((widget) => ({ ...widget })),
    };
  } catch {
    return fallback;
  }
}

export function persistDashboardState(
  state: Pick<DashboardState, 'range' | 'widgets'>,
) {
  const payload: PersistedDashboard = {
    version: 1,
    range: state.range,
    widgets: state.widgets,
  };

  try {
    window.localStorage.setItem(dashboardStorageKey, JSON.stringify(payload));
  } catch {
    // La dashboard resta utilizzabile se il browser nega l'accesso allo storage.
  }
}
