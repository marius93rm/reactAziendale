/** I tipi definiscono il linguaggio comune di dati operativi e widget. */
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
