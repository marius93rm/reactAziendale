module.exports = ",
  code: `// Colori semantici: il nome descrive il ruolo.\\n$color-bg: #07111f;\\n$color-surface: #101e30;\\n$color-accent: #4c7dff;\\n$color-danger: #ff7a8a;\\n\\n// Scala limitata, non valori casuali.\\n$space-1: 0.25rem;\\n$space-2: 0.5rem;\\n$space-4: 1rem;\\n$radius-control: 0.5rem;\\n\\n// Nessun selettore .dashboard in questo file.`,
  bullets: ['Nomi semantici, non componenti.', 'Scala condivisa e limitata.', 'Il partial non conosce le feature.'],
  notes: 'Un token globale descrive una decisione che deve essere coerente in tutto il prodotto. Il nome color-accent sopravvive a un cambio di palette meglio di blue-500, a meno che il design system lavori esplicitamente con scale cromatiche. Il partial non contiene selettori locali.'
});

codeSlide({
  title: '@use rende visibile la dipendenza Sass', eyebrow: 'Sass modules', lang: 'SCSS', filename: 'Dashboard/Dashboard.scss',
  code: `@use '../../styles/variables' as v;\\n\\n.dashboard {\\n  padding: v.$space-4;\\n  background: v.$color-bg;\\n  border-radius: v.$radius-control;\\n\\n  &__title {\\n    color: v.$color-accent;\\n  }\\n}\\n\\n// Il namespace mostra da dove arriva ogni token.`,
  bullets: ['Dipendenza esplicita con namespace.', 'Selettore locale al componente.', 'Nesting poco profondo.'],
  notes: 'Preferire @use al vecchio @import con Dart Sass. Il namespace v rende chiara la provenienza e riduce collisioni. Il nesting è usato per un elemento BEM, non per replicare tutta la struttura DOM. Un wrapper nuovo non dovrebbe cambiare il selettore risultante.'
});

codeSlide({
  title: 'Un namespace BEM mantiene specificità bassa', eyebrow: 'Stile locale', lang: 'SCSS', filename: 'Dashboard.scss',
  code: `.dashboard {\\n  &__header {\\n    display: flex;\\n    justify-content: space-between;\\n  }\\n\\n  &__ticket-list {\\n    display: grid;\\n    gap: v.$space-2;\\n  }\\n\\n  &__ticket--active {\\n    outline: 2px solid v.$color-accent;\\n  }\\n}\\n\\n// Evita .dashboard .panel .list li.active`,
  bullets: ['Prefisso unico e proprietà visibile.', 'Selettori piatti e removibili.', 'Nessuna dipendenza dalla profondità DOM.'],
  notes: 'La convenzione simile a BEM è utile quando gli SCSS sono globali. Il vantaggio non è il nome lungo, ma la proprietà e la specificità controllata. Se la struttura del markup cambia, il selettore non dovrebbe rompersi. Evitare catene basate sui wrapper.'
});

codeSlide({
  title: 'CSS Modules rinforza il pairing con scope automatico', eyebrow: 'Alternativa locale', lang: 'TSX', filename: 'TicketList.tsx',
  code: `import styles from './TicketList.module.scss';\\n\\nexport function TicketList({ tickets }: Props) {\\n  return (\\n    <ul className={styles.list}>\\n      {tickets.map(ticket => (\\n        <li\\n          key={ticket.id}\\n          className={styles.item}\\n        >\\n          {ticket.title}\\n        </li>\\n      ))}\\n    </ul>\\n  );\\n}\\n\\n// Il bundler genera nomi unici.`,
  bullets: ['Import tipicamente locale.', 'Collisioni ridotte dal bundler.', 'Il file resta eliminabile col componente.'],
  notes: 'CSS Modules e BEM non sono obbligatoriamente alternativi. Modules fornisce scope, mentre una convenzione interna può ancora migliorare la leggibilità. Il pairing resta lo stesso: file logico e file di stile condividono il nome base.'
});

compareSlide({
  title: 'Prima: un foglio globale perde la proprietà', eyebrow: 'Leakage e specificità', lang: 'SCSS',
  leftCode: `// styles/app.scss\\n.title { color: blue; }\\n.list li { padding: 8px; }\\n.active { font-weight: bold; }\\n.dashboard .panel .title {\\n  margin-bottom: 12px;\\n}\\n\\n// Ogni correzione alza la specificità.`,
  rightCode: `// Dashboard.scss\\n.dashboard {\\n  &__title { color: v.$color-accent; }\\n  &__list { padding: 0; }\\n  &__ticket--active { font-weight: 700; }\\n}\\n\\n// Le regole appartengono al componente.`,
  footer: 'La prova migliore: posso eliminare il componente senza cercare regole sparse?',
  notes: 'I nomi title, list e active collidono facilmente. La regola più specifica nasce per vincere un conflitto precedente e avvia una spirale. Nel lato destro il namespace assegna proprietà e mantiene selettori facili da rimuovere. La cancellazione è un buon test del confine.'
});

codeSlide({
  title: 'Gli stati interattivi appartengono al controllo', eyebrow: 'Accessibilità visiva', lang: 'SCSS', filename: 'Button.scss',
  code: `.button {\\n  color: v.$color-text-on-accent;\\n  background: v.$color-accent;\\n\\n  &:focus-visible {\\n    outline: 3px solid v.$color-focus;\\n    outline-offset: 2px;\\n  }\\n\\n  &:disabled {\\n    cursor: not-allowed;\\n    opacity: 0.55;\\n  }\\n}\\n\\n// Non dipendere dal colore ereditato dal parent.`,
  bullets: ['Focus visibile e indipendente dall’hover.', 'Disabled conserva leggibilità.', 'Il componente possiede i propri stati.'],
  notes: 'L’ereditarietà è utile per tipografia e testo semplice, ma un controllo interattivo deve proteggere contrasto e stati. focus-visible evita di nascondere il focus da tastiera. Opacity va verificata con il contrasto reale. Il messaggio architetturale è che gli stati del Button appartengono al Button, non al contenitore.'
});

sectionSlide(4, 'State e Hooks', 'Lo stato vive in React; la funzione riceve una fotografia del render.', 'Entrare nel runtime senza trasformare la lezione in un tour del sorgente. Il modello essenziale è: React conserva la memoria, il componente legge uno snapshot e il setter accoda un update.');

compareSlide({
  title: 'Una variabile locale non conserva memoria React', eyebrow: 'Prima e dopo', lang: 'TSX',
  leftCode: `function Counter() {\\n  let count = 0;\\n\\n  function increment() {\\n    count += 1; // cambia solo la variabile locale\\n  }\\n\\n  return (\\n    <button onClick={increment}>{count}</button>\\n  );\\n}`,
  rightCode: `function Counter() {\\n  const [count, setCount] = useState(0);\\n\\n  function increment() {\\n    setCount(previous => previous + 1);\\n  }\\n\\n  return (\\n    <button onClick={increment}>{count}</button>\\n  );\\n}`,
  footer: 'useState conserva il valore e richiede un nuovo render.',
  notes: 'Nel lato sinistro count cambia nella chiusura dell’handler, ma React non riceve una richiesta di aggiornamento. Al render successivo la funzione dichiara di nuovo count uguale a zero. useState fornisce memoria associata alla posizione e un setter che accoda lavoro per il render successivo.'
});

codeSlide({
  title: 'Ogni render vede uno snapshot immutabile', eyebrow: 'State snapshot', lang: 'TSX', filename: 'Counter.tsx',
  code: `function Counter() {\\n  const [count, setCount] = useState(0);\\n\\n  function handleClick() {\\n    setCount(count + 1);\\n\\n    // Mostra ancora il valore del render corrente.\\n    console.log(count);\\n  }\\n\\n  return <button onClick={handleClick}>{count}</button>;\\n}\\n\\n// Il nuovo valore arriverà nel render successivo.`,
  bullets: ['count resta fisso durante l’handler.', 'Il setter non muta la variabile corrente.', 'Gli handler chiudono sui valori del loro render.'],
  notes: 'La parola immutabile descrive lo snapshot del render, non l’impossibilità di aggiornare lo stato. setCount chiede una nuova fotografia. Il console.log legge la chiusura attuale. Questo modello spiega sia gli update multipli sia le stale closure asincrone.'
});

compareSlide({
  title: 'La forma funzionale compone gli update', eyebrow: 'Queue di useState', lang: 'TSX',
  leftCode: `// Tutte le righe leggono lo stesso count.\\nsetCount(count + 1);\\nsetCount(count + 1);\\nsetCount(count + 1);\\n\\n// Risultato del batch: +1`,
  rightCode: `// Ogni updater riceve il risultato precedente.\\nsetCount(c => c + 1);\\nsetCount(c => c + 1);\\nsetCount(c => c + 1);\\n\\n// Risultato del batch: +3`,
  footer: 'Usa un updater quando il prossimo valore dipende dal precedente.',
  notes: 'Nel lato sinistro React accoda tre sostituzioni equivalenti calcolate dallo stesso snapshot. Nel lato destro accoda tre funzioni. Durante il render successivo React passa il risultato di una alla successiva. La forma funzionale rende esplicita la dipendenza dal valore precedente.'
});

compareSlide({
  title: 'Gli oggetti di state si sostituiscono, non si mutano', eyebrow: 'Immutabilità', lang: 'TSX',
  leftCode: `function rename(title: string) {\\n  ticket.title = title; // mutazione\\n  setTicket(ticket);    // stessa reference\\n}\\n\\n// React può ignorare l’update.`,
  rightCode: `function rename(title: string) {\\n  setTicket(previous => ({\\n    ...previous,\\n    title // nuova reference\\n  }));\\n}\\n\\n// Le proprietà non modificate vengono copiate.`,
  footer: 'Crea una nuova rappresentazione dello stato.',
  notes: 'React confronta il nuovo valore con quello precedente usando Object.is. Mutare l’oggetto e passare la stessa reference può evitare un render e rompe il modello degli snapshot. Lo spread crea un nuovo oggetto. Per strutture annidate bisogna copiare ogni livello modificato o usare una strategia dedicata.'
});

compareSlide({
  title: 'Le collezioni si aggiornano con map, filter e spread', eyebrow: 'Array state', lang: 'TSX',
  leftCode: `function closeTicket(id: string) {\\n  const ticket = tickets.find(t => t.id === id);\\n  ticket.status = 'closed'; // muta elemento\\n  setTickets(tickets);      // stessa lista\\n}`,
  rightCode: `function closeTicket(id: string) {\\n  setTickets(current =>\\n    current.map(ticket =>\\n      ticket.id === id\\n        ? { ...ticket, status: 'closed' }\\n        : ticket\\n    )\\n  );\\n}`,
  footer: 'Conserva le reference degli elementi invariati, sostituisci quello modificato.',
  notes: 'Nel lato destro map crea un nuovo array. L’elemento modificato riceve una nuova reference, gli altri restano uguali. Questa precisione è utile anche per memoizzazione e debugging. Evitare di clonare tutto in profondità senza necessità.'
});

codeSlide({
  title: 'La lazy initializer evita lavoro a ogni render', eyebrow: 'Inizializzazione costosa', lang: 'TSX', filename: 'Preferences.tsx',
  code: `function readInitialFilters(): Filters {\\n  const raw = localStorage.getItem(";
