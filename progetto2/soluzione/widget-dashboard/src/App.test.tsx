/** I test di integrazione verificano flussi utente, Context e rollback. */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import type {
  DashboardWidget,
  OperationsSnapshot,
} from './dashboard/dashboard.types';
import type { OperationsApi } from './dashboard/services/OperationsApi';
import { dashboardStorageKey } from './dashboard/state/dashboardStorage';
import { App } from './App';
import { appTheme } from './theme';

const snapshot: OperationsSnapshot = {
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
  alerts: [
    {
      id: 'alert-test',
      siteId: 'site-test',
      title: 'Verifica impianto',
      severity: 'media',
    },
  ],
  updatedAt: '2026-07-23T08:30:00.000Z',
};

function createApi(
  saveWidget: OperationsApi['saveWidget'] = async (widget) => widget,
): OperationsApi {
  return {
    getSnapshot: async () => snapshot,
    saveWidget,
    invalidate: () => undefined,
  };
}

function renderApp(api = createApi()) {
  return render(
    <ThemeProvider theme={appTheme}>
      <App api={api} />
    </ThemeProvider>,
  );
}

describe('Widget dashboard soluzione', () => {
  it('carica i dati e filtra una lista derivata', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.type(screen.getByLabelText('Cerca widget'), 'consumi');

    expect(screen.getByRole('heading', { name: 'Consumi energetici' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Criticità aperte' })).not.toBeInTheDocument();
    expect(screen.getByText('1 widget visibile')).toBeInTheDocument();
  });

  it('crea un widget con aggiornamento ottimistico', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    await user.type(await screen.findByLabelText('Titolo'), 'Presidio serale');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));

    expect(screen.getByRole('heading', { name: 'Presidio serale' })).toBeInTheDocument();
    expect(await screen.findByText('Widget salvato.')).toBeInTheDocument();
  });

  it('cerca anche tramite l\'etichetta italiana del tipo', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await user.click(screen.getByRole('button', { name: 'Modifica Criticità aperte' }));
    await user.clear(await screen.findByLabelText('Titolo'));
    await user.type(screen.getByLabelText('Titolo'), 'Segnalazioni prioritarie');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    await screen.findByRole('heading', { name: 'Segnalazioni prioritarie' });

    await user.type(screen.getByLabelText('Cerca widget'), 'criticità');

    expect(
      screen.getByRole('heading', { name: 'Segnalazioni prioritarie' }),
    ).toBeInTheDocument();
  });

  it('ripristina il widget precedente dopo un errore di salvataggio', async () => {
    let rejectSave: ((reason: Error) => void) | undefined;
    const pendingSave = new Promise<DashboardWidget>((_resolve, reject) => {
      rejectSave = reject;
    });
    const user = userEvent.setup();
    renderApp(createApi(() => pendingSave));
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Modifica Criticità aperte' }));
    await user.clear(await screen.findByLabelText('Titolo'));
    await user.type(screen.getByLabelText('Titolo'), 'Titolo temporaneo');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    expect(screen.getByRole('heading', { name: 'Titolo temporaneo' })).toBeInTheDocument();

    await act(async () => rejectSave?.(new Error('Salvataggio rifiutato.')));

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Criticità aperte' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Salvataggio rifiutato.')).toBeInTheDocument();
  });

  it('persiste il widget soltanto dopo il commit della API', async () => {
    let resolveSave!: (widget: DashboardWidget) => void;
    let submittedWidget: DashboardWidget | undefined;
    const pendingSave = new Promise<DashboardWidget>((resolve) => {
      resolveSave = resolve;
    });
    const user = userEvent.setup();
    renderApp(
      createApi((widget) => {
        submittedWidget = widget;
        return pendingSave;
      }),
    );
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await waitFor(() =>
      expect(window.localStorage.getItem(dashboardStorageKey)).not.toBeNull(),
    );

    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    await user.type(await screen.findByLabelText('Titolo'), 'Presidio serale');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));

    expect(screen.getByRole('heading', { name: 'Presidio serale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ripristina layout' })).toBeDisabled();
    expect(window.localStorage.getItem(dashboardStorageKey)).not.toContain(
      'Presidio serale',
    );

    await act(async () =>
      resolveSave({ ...submittedWidget!, title: 'Presidio confermato' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Presidio confermato' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem(dashboardStorageKey)).toContain(
        'Presidio confermato',
      ),
    );
    expect(screen.getByRole('button', { name: 'Ripristina layout' })).toBeEnabled();
  });

  it('mostra empty state quando la API non restituisce sedi', async () => {
    renderApp({
      ...createApi(),
      getSnapshot: async () => ({ ...snapshot, sites: [], alerts: [] }),
    });

    expect(
      await screen.findByRole('heading', { name: 'Nessuna sede disponibile' }),
    ).toBeInTheDocument();
  });

  it('recupera da un errore con il retry', async () => {
    let requests = 0;
    const user = userEvent.setup();
    renderApp({
      ...createApi(),
      getSnapshot: async () => {
        requests += 1;
        if (requests === 1) throw new Error('Servizio non disponibile');
        return snapshot;
      },
    });
    expect(await screen.findByText('Servizio non disponibile')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Riprova' }));

    expect(
      await screen.findByRole('heading', { name: 'Criticità aperte' }),
    ).toBeInTheDocument();
  });

  it('sposta il focus su Crea widget dopo una eliminazione', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Elimina Criticità aperte' }));
    await user.click(screen.getByRole('button', { name: 'Elimina widget' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Crea widget' })).toHaveFocus(),
    );
  });

  it('salva il Dialog con Invio', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('heading', { name: 'Criticità aperte' });
    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    const title = await screen.findByLabelText('Titolo');
    await user.type(title, 'Presidio tastiera{Enter}');

    expect(
      await screen.findByRole('heading', { name: 'Presidio tastiera' }),
    ).toBeInTheDocument();
  });
});
