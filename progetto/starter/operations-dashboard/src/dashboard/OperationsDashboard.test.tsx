/**
 * I test descrivono il comportamento che deve restare stabile durante il refactoring.
 * Gli studenti non devono conoscere la struttura interna del componente.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OperationsDashboard } from './OperationsDashboard';

describe('OperationsDashboard', () => {
  it('mostra il riepilogo e la coda iniziale', () => {
    render(<OperationsDashboard />);

    expect(
      screen.getByRole('heading', { name: 'Operations Dashboard' }),
    ).toBeInTheDocument();
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1847.*Ordini bloccati nel controllo disponibilità/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('filtra i ticket usando la ricerca controllata', async () => {
    const user = userEvent.setup();
    render(<OperationsDashboard />);

    await user.type(screen.getByRole('searchbox'), 'Fonderie Lario');

    expect(screen.getByText('1 risultati')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /OPS-1796.*Data consegna spostata di un giorno/i,
      }),
    ).toBeInTheDocument();
  });

  it('combina filtro per stato e reset', async () => {
    const user = userEvent.setup();
    render(<OperationsDashboard />);

    await user.selectOptions(screen.getByLabelText('Stato'), 'in-attesa');
    expect(screen.getByText('3 risultati')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reimposta filtri' }));
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });

  it('aggiorna la selezione senza dipendere dalla posizione in lista', async () => {
    const user = userEvent.setup();
    render(<OperationsDashboard />);
    const ticketButton = screen.getByRole('button', {
      name: /OPS-1839.*Doppia notifica per le richieste approvate/i,
    });

    await user.click(ticketButton);

    expect(ticketButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('mostra un empty state e permette di tornare alla coda', async () => {
    const user = userEvent.setup();
    render(<OperationsDashboard />);

    await user.type(screen.getByRole('searchbox'), 'testo senza risultati');
    expect(screen.getByRole('status')).toHaveTextContent('Nessun ticket trovato');

    await user.click(
      screen.getByRole('button', { name: 'Mostra tutti i ticket' }),
    );
    expect(screen.getByText('12 risultati')).toBeInTheDocument();
  });
});
