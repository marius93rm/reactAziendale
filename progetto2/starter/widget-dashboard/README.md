# Widget Dashboard starter

Lo starter presenta una dashboard MUI completa. Puoi caricare dati operativi, cambiare intervallo, cercare widget, crearli, modificarli, riordinarli ed eliminarli.

Il componente `OperationsDashboard.tsx` concentra stato, Effect, trasformazioni e rendering. Questa scelta crea il punto di partenza per il laboratorio. Non devi riparare un'app rotta.

## Requisiti

- Node.js 22.13 o successivo
- npm 10 o successivo
- `nvm` è facoltativo. Puoi usare anche fnm, Volta o un'installazione diretta.

## Avvio

```bash
nvm use
npm ci
npm run dev
```

Senza `nvm`, salta il secondo comando e controlla l'ambiente con:

```bash
node --version
npm --version
```

## Controllo iniziale

1. Attendi il caricamento delle quattro sedi.
2. Cerca `consumi`.
3. Crea un widget e modifica il titolo.
4. Sposta il widget con i pulsanti dedicati.
5. Elimina il widget e conferma l'azione.
6. Ricarica la pagina e controlla la configurazione salvata.

Esegui i controlli automatici:

```bash
npm run check
```

## Scenari della API

Apri questi indirizzi durante il laboratorio:

- `/?scenario=error-once` fallisce la prima lettura e permette il retry.
- `/?scenario=empty` restituisce un dataset vuoto.

## Percorso didattico

Segui il [brief del Modulo 2](../../documentazione/brief-modulo-2.md). Compila la [mappa decisionale dello stato](../../documentazione/mappa-decisionale-stato-studente.md) durante i checkpoint.
