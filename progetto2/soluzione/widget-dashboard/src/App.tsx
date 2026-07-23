/** App compone provider e pagina senza esporre i dettagli del reducer. */
import { DashboardPage } from './dashboard/components/DashboardPage';
import type { OperationsApi } from './dashboard/services/OperationsApi';
import { DashboardProvider } from './dashboard/state/DashboardContext';

export function App({ api }: { api?: OperationsApi }) {
  return (
    <DashboardProvider api={api}>
      <DashboardPage />
    </DashboardProvider>
  );
}
