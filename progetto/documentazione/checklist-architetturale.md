# Checklist architetturale del Modulo 1

Usa questa checklist dopo ogni TODO e durante la code review finale. Scrivi una nota quando una risposta richiede un compromesso.

## Naming e struttura

- [ ] Il nome di ogni componente descrive una responsabilità riconoscibile.
- [ ] I componenti usano PascalCase.
- [ ] Gli hook usano il prefisso `use` e camelCase.
- [ ] Le funzioni usano un verbo che descrive l'azione.
- [ ] I file che cambiano insieme si trovano nella stessa feature.
- [ ] Ogni componente visuale con stili propri usa un component pairing riconoscibile.
- [ ] Non esistono cartelle generiche come `misc`, `common` o `helpers`.

## Componenti e composition

- [ ] Ogni componente ha una responsabilità descrivibile in una frase.
- [ ] I componenti presentazionali ricevono dati e callback tramite props.
- [ ] I componenti presentazionali non importano servizi o fixture.
- [ ] Il layout riceve contenuti tramite `children` o slot nominati.
- [ ] Il layout non importa componenti concreti, hook o tipi di dominio della feature.
- [ ] Le props booleane non creano combinazioni implicite di layout.

## Stato e Hook

- [ ] Lo stato vive nel proprietario comune più vicino ai componenti che lo usano.
- [ ] Query, filtro e selezione rappresentano stato reale.
- [ ] Conteggi, lista filtrata e ticket selezionato derivano da dati e stato.
- [ ] Nessun Effect copia un valore derivabile dentro un secondo stato.
- [ ] Ogni custom hook restituisce dati e azioni, mai JSX.
- [ ] Gli Hook vengono chiamati al top level e nello stesso ordine.

## Effect e flussi asincroni

- [ ] Ogni Effect sincronizza React con timer o servizio dati.
- [ ] Ogni timer possiede una cleanup con `clearTimeout`.
- [ ] Ogni richiesta possiede un `AbortController` dedicato.
- [ ] Un abort non viene mostrato come errore applicativo.
- [ ] Le dipendenze dell'Effect contengono valori reattivi usati dal setup.
- [ ] Il pulsante retry avvia una nuova richiesta senza ricaricare la pagina.

## Dipendenze

- [ ] `App` importa la feature dalla sua API pubblica.
- [ ] Gli import interni alla feature restano diretti.
- [ ] La UI non importa l'implementazione del servizio.
- [ ] Il container riceve o seleziona il servizio e lo passa al custom hook.
- [ ] `shared` contiene soltanto componenti con almeno due usi compatibili.
- [ ] Non esistono dipendenze da `shared` verso `features`.

## Accessibilità e comportamento

- [ ] I controlli possiedono label visibili o nomi accessibili.
- [ ] La lista usa button per la selezione e comunica `aria-pressed`.
- [ ] Loading, error ed empty state comunicano il cambiamento con `aria-live` o `role="status"`.
- [ ] Il focus resta visibile su link, input, select e button.
- [ ] La dashboard funziona a 390, 768 e 1440 pixel.
- [ ] `npm run check` termina senza errori.

## Note di code review

### Tre decisioni che mantengo

1. 
2. 
3. 

### Un compromesso che voglio riesaminare


