/** I tipi distinguono configurazione client, dati server e stato delle richieste. */
export type TimeRange = 'oggi' | '7-giorni' | '30-giorni';

export type SiteHealth = 'regolare' | 'attenzione' | 'critica';

export type Site = {
  id: string;
  name: string;
  city: string;
  health: SiteHealth;
  energyKwh: number;
  occupancy: number;
};

export type OperationsAlert = {
  id: string;
  siteId: string;
  title: string;
  severity: 'media' | 'alta';
};

export type OperationsSnapshot = {
  sites: Site[];
  alerts: OperationsAlert[];
  updatedAt: string;
};

export type WidgetKind = 'alerts' | 'sites' | 'energy' | 'occupancy';
export type WidgetSize = 'compact' | 'wide';

export type DashboardWidget = {
  id: string;
  title: string;
  kind: WidgetKind;
  size: WidgetSize;
};

export type DashboardState = {
  widgets: DashboardWidget[];
  range: TimeRange;
  pendingWidgetIds: string[];
  notice: { severity: 'success' | 'error'; message: string } | null;
};

export type OperationsLoadState = {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  data: OperationsSnapshot | null;
  error: string | null;
  isRefreshing: boolean;
};
