/**
 * Questo file collega React al nodo #root di index.html.
 * StrictMode esegue controlli aggiuntivi durante lo sviluppo.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Il nodo #root non è presente in index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

