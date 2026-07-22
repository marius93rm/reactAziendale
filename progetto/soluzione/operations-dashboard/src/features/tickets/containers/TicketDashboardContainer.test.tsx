/**
 * I test esercitano il flusso visibile del container.
 * findBy e waitFor attendono il servizio senza conoscere il suo timer interno.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createLocalTicketService } from '../services/createLocalTicketService';
import { TicketDashboardContainer } from './TicketDashboardContainer';

const asyncOptions = { timeout: 2_000 };

async function renderLoadedDashboard() {
  render(<TicketDashboardContainer />);

  expect(screen.getByRole('status', { name: 'Caricamento ticket' }))
    .toBeInTheDocument();
  await screen.findByText('12 risultati', {}, asyncOptions);
}

describe('TicketDashboardContainer', () => {
  it('mostra il riepilogo e la coda iniziale', async () => {
    await renderLoadedDashboard();

    expect(
      screen.getByRole('heading', { name: 'Operations Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });

  it('filtra i ticket usando la ricerca controllata', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.type(screen.getByRole('searchbox'), 'Fonderie Lario');

    expect(
      await screen.findByText('1 risultati', {}, asyncOptions),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1796.*Data consegna spostata di un giorno/i,
      }),
    ).toBeInTheDocument();
  });

  it('combina filtro per stato e reset', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.selectOptions(screen.getByLabelText('Stato'), 'in-attesa');
    expect(
      await screen.findByText('3 risultati', {}, asyncOptions),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reimposta filtri' }));
    await waitFor(
      () => expect(screen.getByText('12 risultati')).toBeInTheDocument(),
      asyncOptions,
    );
  });

  it('seleziona un ticket usando il suo id stabile', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();
    const ticketButton = screen.getByRole('button', {
      name: /OPS-1839.*Doppia notifica per le richieste approvate/i,
    });

    await user.click(ticketButton);

    expect(ticketButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('mostra un empty state e permette di tornare alla coda', async () => {
    const user = userEvent.setup();
    await renderLoadedDashboard();

    await user.type(screen.getByRole('searchbox'), 'testo senza risultati');
    expect(
      await screen.findByText('Nessun ticket trovato', {}, asyncOptions),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Mostra tutti i ticket' }),
    );
    expect(
      await screen.findByText('12 risultati', {}, asyncOptions),
    ).toBeInTheDocument();
  });

  it("mostra l'errore e completa il retry dalla UI", async () => {
    const user = userEvent.setup();
    const service = createLocalTicketService({
      delay: 0,
      failFirstRequest: true,
    });

    render(<TicketDashboardContainer service={service} />);

    expect(await screen.findByRole('alert', {}, asyncOptions)).toHaveTextContent(
      'Il servizio ticket non è disponibile',
    );

    await user.click(screen.getByRole('button', { name: 'Riprova' }));

    expect(
      await screen.findByText('12 risultati', {}, asyncOptions),
    ).toBeInTheDocument();
  });
});
