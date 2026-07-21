module.exports = "'Cleanup anche allo smontaggio.'],
  notes: 'Evitare la formula “codice dopo il render” perché non descrive lo scopo. L’Effect mantiene un sistema esterno coerente con props e state. Quando una dipendenza cambia, React esegue la cleanup con i vecchi valori e poi il nuovo setup. La simmetria rende il processo robusto anche in Strict Mode.'
});

codeSlide({
  title: 'Un listener viene registrato e rimosso con la stessa funzione', eyebrow: 'DOM event', lang: 'TSX', filename: 'useEscapeKey.ts',
  code: `export function useEscapeKey(onEscape: () => void) {\\n  useEffect(() => {\\n    function handleKeyDown(event: KeyboardEvent) {\\n      if (event.key === 'Escape') onEscape();\\n    }\\n\\n    window.addEventListener('keydown', handleKeyDown);\\n\\n    return () => {\\n      // Stessa reference usata nel setup.\\n      window.removeEventListener('keydown', handleKeyDown);\\n    };\\n  }, [onEscape]);\\n}`,
  bullets: ['La funzione vive dentro l’Effect.', 'Setup e cleanup condividono la reference.', 'onEscape è una dipendenza reale.'],
  notes: 'removeEventListener deve ricevere la stessa funzione registrata. Definendola dentro l’Effect, setup e cleanup condividono la reference della stessa esecuzione. Se onEscape cambia a ogni render, l’Effect si risincronizza; la stabilità della callback si valuta nel chiamante e nel modulo performance.'
});

codeSlide({
  title: 'Un timer deve essere cancellato quando cambia la dipendenza', eyebrow: 'Timer lifecycle', lang: 'TSX', filename: 'AutoSave.tsx',
  code: `useEffect(() => {\\n  if (!draft.isDirty) return;\\n\\n  const timerId = window.setTimeout(() => {\\n    saveDraft(draft);\\n  }, 1000);\\n\\n  return () => {\\n    // Un nuovo draft sostituisce il timer precedente.\\n    window.clearTimeout(timerId);\\n  };\\n}, [draft]);\\n\\n// Solo l’ultima versione resta programmata.`,
  bullets: ['Ogni draft crea un timer.', 'La cleanup cancella il precedente.', 'Lo smontaggio evita un salvataggio tardivo.'],
  notes: 'Quando draft cambia, React esegue prima la cleanup dell’Effect precedente. Questo comportamento trasforma il timer in un autosave debounced. Attenzione alla granularità della dipendenza: se draft è un oggetto ricreato senza necessità, il timer riparte. Il modello resta setup e cleanup.'
});

codeSlide({
  title: 'Una connessione segue l’identità della stanza', eyebrow: 'WebSocket / subscription', lang: 'TSX', filename: 'TicketChannel.tsx',
  code: `useEffect(() => {\\n  const connection = createConnection({\\n    roomId: ticketId\\n  });\\n\\n  connection.connect();\\n\\n  return () => {\\n    // Chiude la connessione del vecchio ticket.\\n    connection.disconnect();\\n  };\\n}, [ticketId]);\\n\\n// ticketId A: setup A → cleanup A → setup B`,
  bullets: ['Il processo esterno segue ticketId.', 'La cleanup usa i valori del vecchio setup.', 'Nessuna connessione orfana.'],
  notes: 'Quando ticketId passa da A a B, la cleanup chiude la connessione A prima che il nuovo setup apra B. Non serve una variabile globale per ricordare la connessione corrente: ogni esecuzione dell’Effect chiude sulla propria connection. Questo è il valore del modello simmetrico.'
});

compareSlide({
  title: 'Una fetch ingenua può produrre una race condition', eyebrow: 'Risposte fuori ordine', lang: 'TSX',
  leftCode: `useEffect(() => {\\n  setLoading(true);\\n\\n  fetchTickets(query).then(data => {\\n    setTickets(data);\\n    setLoading(false);\\n  });\\n}, [query]);\\n\\n// La risposta di \"rea\" può arrivare dopo \"react\".`,
  rightCode: `useEffect(() => {\\n  const controller = new AbortController();\\n  setLoading(true);\\n\\n  fetchTickets(query, controller.signal)\\n    .then(setTickets)\\n    .finally(() => setLoading(false));\\n\\n  return () => controller.abort();\\n}, [query]);`,
  footer: 'La cleanup rende obsoleta la richiesta precedente.',
  notes: 'Il problema non è soltanto il numero di richieste. Le risposte possono arrivare fuori ordine e sovrascrivere dati più recenti. AbortController comunica alla fetch precedente che non è più necessaria. Nella slide successiva gestiamo correttamente AbortError e lo stato loading.'
});

codeSlide({
  title: 'AbortController annulla la richiesta obsoleta', eyebrow: 'Fetch robusta', lang: 'TSX', filename: 'useTickets.ts',
  code: `useEffect(() => {\\n  const controller = new AbortController();\\n  setStatus('loading');\\n  setError(null);\\n\\n  fetchTickets(query, controller.signal)\\n    .then(data => {\\n      setTickets(data);\\n      setStatus('success');\\n    })\\n    .catch(error => {\\n      if (error.name === 'AbortError') return;\\n      setError(error);\\n      setStatus('error');\\n    });\\n\\n  return () => controller.abort();\\n}, [query]);`,
  bullets: ['Abort non è un errore per l’utente.', 'La cleanup ferma il lavoro obsoleto.', 'Il service accetta AbortSignal.'],
  notes: 'La catch distingue AbortError dagli errori reali. Non mostriamo un banner quando React annulla una richiesta perché query è cambiata. In alcuni client HTTP l’errore ha una forma diversa; il service può normalizzarlo. La responsabilità del hook resta il lifecycle.'
});

codeSlide({
  title: 'Un flag locale può ignorare risultati obsoleti', eyebrow: 'Alternativa quando abort non è disponibile', lang: 'TSX', filename: 'useTicketDetails.ts',
  code: `useEffect(() => {\\n  let ignore = false;\\n\\n  fetchTicketDetails(ticketId).then(data => {\\n    if (!ignore) setDetails(data);\\n  });\\n\\n  return () => {\\n    // La promessa continua, ma il risultato non aggiorna la UI.\\n    ignore = true;\\n  };\\n}, [ticketId]);\\n\\n// Preferisci AbortController quando il client lo supporta.`,
  bullets: ['Ogni Effect possiede il proprio flag.', 'La cleanup rende il risultato inutilizzabile.', 'Il lavoro di rete non viene realmente fermato.'],
  notes: 'Il flag è confinato alla singola esecuzione dell’Effect. Quando ticketId cambia, la cleanup imposta ignore e la vecchia promise non aggiorna lo state. È una protezione contro la race, ma non risparmia rete o server. AbortController è preferibile quando supportato.'
});

compareSlide({
  title: 'Le dipendenze mancanti congelano valori vecchi', eyebrow: 'Exhaustive deps', lang: 'TSX',
  leftCode: `useEffect(() => {\\n  const connection = createConnection(ticketId);\\n  connection.connect();\\n  return () => connection.disconnect();\\n}, []); // ticketId letto ma non dichiarato\\n\\n// La connessione resta sul ticket iniziale.`,
  rightCode: `useEffect(() => {\\n  const connection = createConnection(ticketId);\\n  connection.connect();\\n  return () => connection.disconnect();\\n}, [ticketId]);\\n\\n// Il processo segue il valore reattivo.`,
  footer: 'Non scegliere le dipendenze: descrivi i valori letti dall’Effect.',
  notes: 'L’array non è una lista di eventi che vogliamo ascoltare. È la descrizione dei valori reattivi letti dal setup. Se non vogliamo risincronizzare per un valore, dobbiamo cambiare il codice: spostare una lettura nell’evento, estrarre una costante non reattiva o rivedere la responsabilità. Disabilitare il linter nasconde il problema.'
});

compareSlide({
  title: 'Un calcolo derivato non richiede un Effect', eyebrow: 'You might not need an Effect', lang: 'TSX',
  leftCode: `const [fullName, setFullName] = useState('');\\n\\nuseEffect(() => {\\n  setFullName(firstName + ' ' + lastName);\\n}, [firstName, lastName]);\\n\\nreturn <h2>{fullName}</h2>;\\n\\n// State duplicato e render aggiuntivo.`,
  rightCode: `const fullName = firstName + ' ' + lastName;\\n\\nreturn <h2>{fullName}</h2>;\\n\\n// Calcolo puro nel render.\\n// Nessuna sincronizzazione esterna.`,
  footer: 'Effect è una via di uscita verso sistemi esterni, non un motore di calcoli.',
  notes: 'fullName dipende soltanto da props o state e può essere calcolato immediatamente. Il lato sinistro renderizza prima il valore vecchio, poi esegue l’Effect e provoca un secondo render. Rimuovere l’Effect riduce codice e stati incoerenti.'
});

codeSlide({
  title: 'Il debounce sostituisce il timer a ogni input', eyebrow: 'Ricerca remota', lang: 'TSX', filename: 'SearchField.tsx',
  code: `useEffect(() => {\\n  const trimmed = query.trim();\\n  if (!trimmed) return;\\n\\n  const timerId = window.setTimeout(() => {\\n    onSearch(trimmed);\\n  }, 400);\\n\\n  return () => {\\n    // Il carattere successivo cancella il timer precedente.\\n    window.clearTimeout(timerId);\\n  };\\n}, [query, onSearch]);\\n\\n// Solo una pausa completa avvia la ricerca.`,
  bullets: ['Ogni query crea un timer.', 'La cleanup cancella il timer obsoleto.', 'La latenza di 400 ms è intenzionale.'],
  notes: 'Il debounce riduce chiamate durante una sequenza rapida di input. Non garantisce l’ordine delle risposte e non sostituisce AbortController. La durata va scelta in base al prodotto. Il codice mostra ancora l’Effect nel componente; la slide successiva estrae il comportamento riusabile.'
});

codeSlide({
  title: 'useDebouncedValue isola il tempo come responsabilità', eyebrow: 'Custom hook', lang: 'TS', filename: 'useDebouncedValue.ts',
  code: `export function useDebouncedValue<T>(\\n  value: T,\\n  delayMs: number\\n): T {\\n  const [debounced, setDebounced] = useState(value);\\n\\n  useEffect(() => {\\n    const timerId = window.setTimeout(() => {\\n      setDebounced(value);\\n    }, delayMs);\\n\\n    return () => window.clearTimeout(timerId);\\n  }, [value, delayMs]);\\n\\n  return debounced;\\n}`,
  bullets: ['Il hook è generico sul tipo T.', 'Setup e cleanup restano simmetrici.', 'Il componente non conosce setTimeout.'],
  notes: 'Il hook restituisce l’ultimo valore che è rimasto stabile per delayMs. È riusabile per ricerca, validazione o autosave, ma non deve diventare una soluzione universale per ogni input. Il comportamento temporale è ora testabile separatamente con fake timers.'
});

codeSlide({
  title: 'Il hook dei ticket combina debounce, fetch e cleanup', eyebrow: 'Flusso asincrono completo', lang: 'TS', filename: 'useTickets.ts',
  code: `export function useTickets(query: string) {\\n  const debouncedQuery = useDebounced";
