# Meteo Sedi, starter useEffect e Context

Lo starter mostra la struttura completa della dashboard e le quattro sedi del
laboratorio. Il pannello meteo parte senza dati: aggiungerai Context, adapter
HTTP e `useEffect` seguendo il brief.

## Requisiti

- Node.js 22.13 o successivo. La versione consigliata è indicata in `.nvmrc`.
- npm 10 o successivo.

Non servono account, chiavi API o variabili ambiente. Open-Meteo espone il
servizio gratuito usato dal laboratorio tramite richieste HTTP pubbliche.

## Primo avvio

```bash
cd progetto2bis/starter/meteo-sedi
nvm use
npm ci
npm run dev
```

La pagina deve mostrare intestazione, selezione della sede e stato iniziale del
pannello meteo. Lo starter non esegue richieste di rete e non usa previsioni
simulate.

## Comandi

| Comando | Uso |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo. |
| `npm run test` | Esegue i test una volta. |
| `npm run test:watch` | Riesegue i test dopo ogni modifica. |
| `npm run lint` | Controlla TypeScript e regole degli Hook. |
| `npm run build` | Controlla i tipi e crea la build. |
| `npm run check` | Esegue lint, test e build. |

## Percorso

1. Leggi il [brief guidato](../../documentazione/brief-useeffect-context.md).
2. Completa un TODO alla volta.
3. Prova il comportamento indicato nel checkpoint.
4. Esegui `npm run check` prima del TODO successivo.
5. Compila la [mappa Effect e Context](../../documentazione/mappa-effect-context-studente.md).

I dati reali compaiono dopo l'implementazione dell'adapter Open-Meteo e del
custom hook `useForecast`.
