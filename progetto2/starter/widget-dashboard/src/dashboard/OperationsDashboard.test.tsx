/** I test proteggono i flussi che il refactoring didattico deve conservare. */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { appTheme } from '../theme';
import type { OperationsSnapshot } from './dashboard.types';
import { OperationsDashboard } from './OperationsDashboard';

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

function renderDashboard(
  loadSnapshot = async () => snapshot,
) {
  return render(
    <ThemeProvider theme={appTheme}>
      <OperationsDashboard loadSnapshot={loadSnapshot} />
    </ThemeProvider>,
  );
}

describe('OperationsDashboard starter', () => {
  it('carica i dati e mostra i widget iniziali', async () => {
    renderDashboard();

    expect(
      screen.getByRole('status', { name: 'Caricamento dashboard' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Criticità aperte' }),
    ).toBeInTheDocument();
    expect(screen.getByText('4 widget visibili')).toBeInTheDocument();
  });

  it('filtra i widget senza duplicare la lista nello stato', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.type(screen.getByLabelText('Cerca widget'), 'consumi');

    expect(
      screen.getByRole('heading', { name: 'Consumi energetici' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Criticità aperte' })).not.toBeInTheDocument();
    expect(screen.getByText('1 widget visibile')).toBeInTheDocument();
  });

  it('crea un widget', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Crea widget' }));
    await user.type(await screen.findByLabelText('Titolo'), 'Presidio serale');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    expect(
      await screen.findByRole('heading', { name: 'Presidio serale' }),
    ).toBeInTheDocument();
  });

  it('modifica un widget', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Modifica Criticità aperte' }));
    await user.clear(await screen.findByLabelText('Titolo'));
    await user.type(screen.getByLabelText('Titolo'), 'Presidio notturno');
    await user.click(screen.getByRole('button', { name: 'Salva widget' }));
    expect(
      await screen.findByRole('heading', { name: 'Presidio notturno' }),
    ).toBeInTheDocument();
  });

  it('elimina un widget e sposta il focus su Crea widget', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Elimina Criticità aperte' }));
    await user.click(screen.getByRole('button', { name: 'Elimina widget' }));
    expect(screen.queryByRole('heading', { name: 'Criticità aperte' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Crea widget' })).toHaveFocus(),
    );
  });

  it('mantiene visibili i dati durante un refresh', async () => {
    let resolveRefresh!: (value: OperationsSnapshot) => void;
    let requests = 0;
    const user = userEvent.setup();
    renderDashboard(async () => {
      requests += 1;
      if (requests === 1) return snapshot;
      return new Promise((resolve) => {
        resolveRefresh = resolve;
      });
    });
    await screen.findByRole('heading', { name: 'Criticità aperte' });

    await user.click(screen.getByRole('button', { name: 'Aggiorna dati' }));

    expect(screen.getByLabelText('Aggiornamento dati')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Criticità aperte' })).toBeInTheDocument();

    await act(async () => resolveRefresh(snapshot));
    await waitFor(() =>
      expect(screen.queryByLabelText('Aggiornamento dati')).not.toBeInTheDocument(),
    );
  });

  it('conserva un layout vuoto salvato', async () => {
    window.localStorage.setItem(
      'react-aziendale:widget-dashboard:starter',
      '[]',
    );

    renderDashboard();

    expect(
      await screen.findByRole('heading', { name: 'Nessun widget configurato' }),
    ).toBeInTheDocument();
  });

  it('mostra empty state quando la API non restituisce sedi', async () => {
    renderDashboard(async () => ({ ...snapshot, sites: [], alerts: [] }));

    expect(
      await screen.findByRole('heading', { name: 'Nessuna sede disponibile' }),
    ).toBeInTheDocument();
  });

  it('recupera da un errore con il retry', async () => {
    let requests = 0;
    const user = userEvent.setup();
    renderDashboard(async () => {
      requests += 1;
      if (requests === 1) throw new Error('Servizio non disponibile');
      return snapshot;
    });
    expect(await screen.findByText('Servizio non disponibile')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Riprova' }));

    expect(
      await screen.findByRole('heading', { name: 'Criticità aperte' }),
    ).toBeInTheDocument();
  });
});
