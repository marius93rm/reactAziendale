# Mappa Effect e Context da compilare

Usa questa scheda durante i checkpoint di Meteo Sedi. Classifica ogni valore
prima di scegliere `useState`, Context o `useEffect`.

## Percorso per decidere

```text
Puoi calcolare il valore da props o stato disponibili durante il render?
  Sì -> derived state
        calcolalo durante il render
        non usare useState o useEffect
  No -> nasce da un'interazione in questo componente?
        Sì -> stato locale oppure handler dell'evento
        No -> più rami distanti devono leggerlo o modificarlo?
              Sì -> stato condiviso con Context
              No -> mantienilo nel proprietario più vicino

Il valore arriva da un'API?
  Sì -> server state
        adapter + custom hook
        gestisci loading, error, empty, retry e refresh

Devi sincronizzare React con rete, storage, timer o subscription?
  Sì -> useEffect
        elenca tutte le dipendenze reattive
        restituisci il cleanup se il lavoro può continuare dopo il render

Il codice risponde a un click o a un submit?
  Sì -> eseguilo nell'event handler
        non creare un Effect che osserva un flag
```

Context distribuisce client state a consumer distanti. Il Context non cambia
la natura dei dati e non sostituisce l'adapter dell'API.

## Inventario dello stato

Compila una riga per ogni valore individuato nello starter.

| Valore | Sorgente | Chi legge | Chi modifica | Categoria | Proprietario | Serve un Effect? |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |

## Scheda di un Effect

Compila una scheda per la persistenza e una per la richiesta meteo.

| Domanda | Risposta |
| --- | --- |
| Sistema esterno sincronizzato |  |
| Valori reattivi letti |  |
| Array delle dipendenze |  |
| Lavoro avviato |  |
| Cleanup |  |
| Rischio senza cleanup |  |
| Comportamento in StrictMode |  |

## Controlli per la code review

- [ ] Il Context contiene solo sede e unità condivise.
- [ ] `selectedSite` deriva da `selectedSiteId` e dal catalogo.
- [ ] Il custom hook possiede dati e stato della richiesta.
- [ ] Gli Effect sincronizzano React con storage o rete.
- [ ] Gli event handler di `WeatherDashboard` gestiscono selezione, retry e refresh.
- [ ] Ogni Effect dichiara le dipendenze lette.
- [ ] La richiesta restituisce un cleanup che chiama `abort()`.
- [ ] Un `AbortError` non produce un messaggio per l'utente.
- [ ] Il servizio valida il payload prima di creare `Forecast`.
- [ ] I test sostituiscono rete e adapter con dipendenze controllate.

Confronta il foglio con
[`mappa-effect-context.md`](mappa-effect-context.md) dopo il TODO 10.
