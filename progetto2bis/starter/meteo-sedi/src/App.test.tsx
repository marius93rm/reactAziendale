import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { App } from './App';
import { appTheme } from './theme';

function renderApp() {
  return render(
    <ThemeProvider theme={appTheme}>
      <App />
    </ThemeProvider>,
  );
}

describe('Meteo sedi starter', () => {
  it('avvia la shell e mostra le quattro sedi senza dati simulati', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Meteo sedi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Milano' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Torino' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bologna' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bari' })).toBeInTheDocument();
    expect(screen.getByText('Dati meteo da collegare')).toBeInTheDocument();
    expect(screen.queryByText(/°C|°F/)).not.toBeInTheDocument();
  });

  it('espone landmark, gruppi e nomi accessibili', () => {
    renderApp();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Scegli sede' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Unità di temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
  });

  it('non esegue chiamate di rete prima dei TODO', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderApp();

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
