/**
 * Il layout conosce le posizioni della dashboard.
 * I nodi arrivano dal chiamante, quindi il layout non importa la feature.
 */
import type { ReactNode } from 'react';
import './TicketDashboardLayout.scss';

type TicketDashboardLayoutProps = {
  sidebar: ReactNode;
  detail?: ReactNode;
  children: ReactNode;
};

export function TicketDashboardLayout({
  sidebar,
  detail,
  children,
}: TicketDashboardLayoutProps) {
  return (
    <div className="ticket-dashboard-layout">
      <aside
        className="ticket-dashboard-layout__sidebar"
        aria-label="Filtri ticket"
      >
        {sidebar}
      </aside>
      <section className="ticket-dashboard-layout__content">{children}</section>
      {detail ? (
        <aside
          className="ticket-dashboard-layout__detail"
          aria-label="Dettaglio ticket"
        >
          {detail}
        </aside>
      ) : null}
    </div>
  );
}
