module.exports = "'ticket-filters');\\n  return raw ? JSON.parse(raw) : DEFAULT_FILTERS;\\n}\\n\\nexport function Preferences() {\\n  // React chiama la funzione durante l’inizializzazione.\\n  const [filters, setFilters] = useState(readInitialFilters);\\n\\n  return <FiltersForm value={filters} onChange={setFilters} />;\\n}\\n\\n// Evita useState(readInitialFilters()) se la lettura è costosa.`,
  bullets: ['Passa la funzione, non il risultato.', 'Il calcolo iniziale resta fuori dal render successivo.', 'L’inizializzatore deve essere puro.'],
  notes: 'Passando readInitialFilters senza parentesi, React usa la funzione come initializer. In Strict Mode può chiamarla più volte in sviluppo per verificare la purezza, quindi non deve produrre side effect. La lettura da localStorage è sincrona e va usata con giudizio; qui il punto è la forma lazy.'
});

compareSlide({
  title: 'Non duplicare nello state ciò che si può derivare', eyebrow: 'Derived state', lang: 'TSX',
  leftCode: `const [tickets, setTickets] = useState<Ticket[]>([]);\\nconst [openTickets, setOpenTickets] = useState<Ticket[]>([]);\\n\\nuseEffect(() => {\\n  setOpenTickets(tickets.filter(t => t.status === 'open'));\\n}, [tickets]);\\n\\n// Due fonti di verità.`,
  rightCode: `const [tickets, setTickets] = useState<Ticket[]>([]);\\n\\n// Calcolo puro durante il render.\\nconst openTickets = tickets.filter(\\n  ticket => ticket.status === 'open'\\n);\\n\\n// Una sola fonte di verità.`,
  footer: 'Se un valore dipende solo da props e state, calcolalo durante il render.',
  notes: 'Il lato sinistro aggiunge un Effect, un render in più e il rischio di desincronizzazione. Il filtro è un calcolo puro e può essere eseguito durante il render. Se diventa realmente costoso, la performance si misura e si valuta useMemo nel modulo dedicato, non si duplica lo stato.'
});

compareSlide({
  title: 'Gli Hook devono mantenere lo stesso ordine', eyebrow: 'Rules of Hooks', lang: 'TSX',
  leftCode: `function TicketPanel({ ready }) {\\n  const [query, setQuery] = useState('');\\n\\n  if (ready) {\\n    useEffect(() => {\\n      // Hook condizionale: ordine instabile.\\n    }, []);\\n  }\\n\\n  const [selected, setSelected] = useState(null);\\n}`,
  rightCode: `function TicketPanel({ ready }) {\\n  const [query, setQuery] = useState('');\\n  const [selected, setSelected] = useState(null);\\n\\n  useEffect(() => {\\n    if (!ready) return;\\n    // La condizione vive dentro l’Effect.\\n  }, [ready]);\\n}`,
  footer: 'Top level: React abbina gli Hook in base all’ordine.',
  notes: 'React percorre la lista degli Hook nello stesso ordine a ogni render. Se una chiamata compare solo quando ready è true, gli Hook successivi cambiano posizione logica. La condizione deve vivere dentro l’Hook oppure il comportamento va estratto in un componente separato. Il linter deve restare attivo.'
});

codeSlide({
  title: 'Il batching evita UI intermedie', eyebrow: 'Coda degli update', lang: 'TSX', filename: 'Selection.tsx',
  code: `function handleSelect(ticket: Ticket) {\\n  // Due update nello stesso evento.\\n  setSelectedId(ticket.id);\\n  setIsDetailsOpen(true);\\n\\n  // React li elabora insieme quando possibile.\\n}\\n\\n// Flusso mentale:\\n// evento → queue → render → commit → paint`,
  bullets: ['I setter accodano lavoro.', 'React può raggruppare update compatibili.', 'Il DOM cambia nella fase commit.'],
  notes: 'Il batching permette a React di evitare stati intermedi come selectedId aggiornato ma pannello ancora chiuso. Non bisogna basare la logica sull’idea che il DOM cambi dopo ogni setter. Il render deve restare puro perché React può pianificarlo, interromperlo o ripeterlo prima del commit.'
});

compareSlide({
  title: 'Una callback asincrona può leggere uno snapshot vecchio', eyebrow: 'Stale closure', lang: 'TSX',
  leftCode: `function delayedIncrement() {\\n  setTimeout(() => {\\n    // count appartiene al render del click.\\n    setCount(count + 1);\\n  }, 1000);\\n}\\n\\n// Più click possono usare lo stesso valore.`,
  rightCode: `function delayedIncrement() {\\n  setTimeout(() => {\\n    // React passa il valore più recente della coda.\\n    setCount(current => current + 1);\\n  }, 1000);\\n}\\n\\n// Ogni callback compone il proprio update.`,
  footer: 'Quando il prossimo stato dipende dal precedente, usa la forma funzionale.',
  notes: 'La callback del timer chiude sul count del render in cui è stata creata. Se l’utente clicca più volte rapidamente, tutte le callback possono proporre lo stesso valore. L’updater non legge la chiusura e riceve il valore corrente durante l’elaborazione della coda.'
});

sectionSlide(5, 'Reconciliation e identità', 'React conserva lo state quando tipo, posizione e key mantengono identità.', 'Collegare keys e posizione allo state locale. La key non serve soltanto a rimuovere un warning: comunica quale entità deve conservare identità attraverso inserimenti e riordini.');

compareSlide({
  title: 'La key per indice segue la posizione, non l’entità', eyebrow: 'Liste dinamiche', lang: 'TSX',
  leftCode: `tickets.map((ticket, index) => (\\n  <TicketRow\\n    key={index} // identità = posizione\\n    ticket={ticket}\\n  />\\n));\\n\\n// Un riordino può spostare lo state locale.`,
  rightCode: `tickets.map(ticket => (\\n  <TicketRow\\n    key={ticket.id} // identità = ticket\\n    ticket={ticket}\\n  />\\n));\\n\\n// Lo state segue l’entità corretta.`,
  footer: 'Usa un identificatore stabile presente nei dati.',
  notes: 'La key per indice è accettabile soltanto per liste statiche che non cambiano ordine o contenuto. Se inseriamo un elemento in testa, React riutilizza le posizioni e può associare input, focus o stato locale alla riga sbagliata. ticket.id segue l’entità.'
});

codeSlide({
  title: 'Non generare key casuali durante il render', eyebrow: 'Identità instabile', lang: 'TSX', filename: 'TicketList.tsx',
  code: `tickets.map(ticket => (\\n  <TicketRow\\n    key={crypto.randomUUID()} // cambia a ogni render\\n    ticket={ticket}\\n  />\\n));\\n\\n// React considera ogni riga una nuova istanza.\\n// Conseguenze: remount, focus perso, state resettato.\\n\\n// Corretto:\\n<TicketRow key={ticket.id} ticket={ticket} />`,
  bullets: ['La key deve essere stabile tra render.', 'Generala quando nasce l’entità, non nel JSX.', 'Una key nuova forza il remount.'],
  notes: 'Una key casuale elimina qualsiasi possibilità di riuso. Ogni render smonta e rimonta le righe, con perdita di focus, state e lavoro DOM. Se i dati non possiedono un id, l’identificatore va creato quando l’elemento entra nel modello e poi conservato.'
});

codeSlide({
  title: 'Una key può resettare intenzionalmente lo state', eyebrow: 'Reset controllato', lang: 'TSX', filename: 'TicketDetails.tsx',
  code: `function DetailsPane({ ticketId }: { ticketId: string }) {\\n  return (\\n    <TicketEditor\\n      key={ticketId} // nuova entità → nuova istanza\\n      ticketId={ticketId}\\n    />\\n  );\\n}\\n\\nfunction TicketEditor({ ticketId }) {\\n  const [draft, setDraft] = useState(() => loadDraft(ticketId));\\n  // Cambiando ticketId, il draft riparte dal nuovo ticket.\\n}`,
  bullets: ['Key comunica un cambio di identità.', 'Lo state locale viene ricreato.', 'Usala quando il reset è il comportamento desiderato.'],
  notes: 'La key non è soltanto per le liste. Qui TicketEditor rappresenta un editor legato a una specifica entità. Quando ticketId cambia, vogliamo scartare draft e validation state. La key rende esplicito il reset. Se invece vogliamo preservare il draft fra ticket, la key non va cambiata.'
});

compareSlide({
  title: 'La stessa posizione conserva lo state', eyebrow: 'Preserving state', lang: 'TSX',
  leftCode: `return (\\n  <section>\\n    {isCompact\\n      ? <Counter compact />\\n      : <Counter compact={false} />}\\n  </section>\\n);\\n\\n// Stesso tipo e stessa posizione: state preservato.`,
  rightCode: `return isCompact\\n  ? <section><Counter /></section>\\n  : <aside><Counter /></aside>;\\n\\n// Il Counter occupa rami strutturali diversi.\\n// React può ricrearne l’identità.`,
  footer: 'L’identità dipende dall’albero risultante, non dalla riga sorgente.',
  notes: 'Nel lato sinistro Counter resta il primo figlio di section, quindi React lo considera la stessa istanza e cambia soltanto la prop. Nel lato destro il tipo del parent cambia e il sottoalbero viene sostituito. Chiedere ai partecipanti di ragionare sull’albero, non sulla posizione visiva nel file.'
});

compareSlide({
  title: 'Definire un componente dentro un altro ne cambia l’identità', eyebrow: 'Nested definitions', lang: 'TSX',
  leftCode: `function TicketsPage() {\\n  function EmptyState() {\\n    return <p>Nessun ticket</p>;\\n  }\\n\\n  return tickets.length === 0\\n    ? <EmptyState />\\n    : <TicketList tickets={tickets} />;\\n}\\n\\n// Nuova funzione componente a ogni render.`,
  rightCode: `function EmptyState() {\\n  return <p>Nessun ticket</p>;\\n}\\n\\nfunction TicketsPage() {\\n  return tickets.length === 0\\n    ? <EmptyState />\\n    : <TicketList tickets={tickets} />;\\n}\\n\\n// Il tipo del componente resta stabile.`,
  footer: 'Definisci i componenti al top level.',
  notes: 'Ogni render di TicketsPage crea una nuova funzione EmptyState. React vede un tipo diverso e ricrea il sottoalbero. Anche se il componente non ha state, la regola migliora prevedibilità e performance. Le definizioni top-level forniscono identità stabile.'
});

sectionSlide(6, 'useEffect e ciclo asincrono', 'Un Effect sincronizza React con un sistema esterno.', 'Usare la parola sincronizzazione. Un Effect possiede setup e cleanup. Se il codice produce soltanto un valore per il JSX, non serve un Effect.');

conceptSlide({
  title: 'Ogni Effect deve avere un contratto simmetrico', eyebrow: 'Setup e cleanup',
  definition: 'Il setup avvia un processo esterno; la cleanup annulla esattamente ciò che il setup ha avviato.',
  example: 'subscribe → unsubscribe · setTimeout → clearTimeout',
  bullets: ['Dipendenze = valori reattivi letti.', 'Cleanup prima del nuovo setup.', ";
