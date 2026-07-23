# Meteo Sedi, soluzione useEffect e Context

La soluzione completa il laboratorio con preferenze condivise tramite Context,
persistenza locale, adapter Open-Meteo e gestione della richiesta dentro
`useForecast`.

## Requisiti e avvio

```bash
cd progetto2bis/soluzione/meteo-sedi
nvm use
npm ci
npm run dev
```

Non servono account, chiavi API o variabili ambiente. Il browser deve poter
raggiungere `https://api.open-meteo.com` per mostrare le previsioni reali.

## Comandi

| Comando | Uso |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo. |
| `npm run test` | Esegue i test senza rete reale. |
| `npm run test:watch` | Riesegue i test dopo ogni modifica. |
| `npm run lint` | Controlla TypeScript e regole degli Hook. |
| `npm run build` | Controlla i tipi e crea la build. |
| `npm run check` | Esegue lint, test e build. |

## Comportamenti implementati

- selezione della sede e dell'unità tramite Context;
- persistenza difensiva delle preferenze in `localStorage`;
- costruzione e validazione della richiesta Open-Meteo;
- mapping del payload esterno nei tipi del dominio;
- cleanup con `AbortController` quando cambiano sede o unità;
- loading, success, empty state, error, retry e refresh;
- test del Context, del servizio, dell'hook e del flusso integrato.

I test iniettano adapter controllati e non chiamano il servizio pubblico. La UI
mostra l'attribuzione richiesta per i dati Open-Meteo.

Consulta il [brief guidato](../../documentazione/brief-useeffect-context.md) e
la [mappa risolta](../../documentazione/mappa-effect-context.md) per seguire le
decisioni tecniche.
