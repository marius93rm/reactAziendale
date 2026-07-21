module.exports = "/>}\\n      {props.mode === 'reports' && <Reports />}\\n      {props.showFilters && <TicketFilters />}\\n      {props.showFooter && <Pagination />}\\n    </div>\\n  );\\n}`,
  bullets: ['Il layout importa ogni contenuto futuro.', 'Tre booleani creano fino a otto combinazioni.', 'Le varianti non valide restano rappresentabili.'],
  notes: 'Non demonizzare gli if. Il problema è la responsabilità: Dashboard conosce sia la struttura sia ogni contenuto possibile. Le boolean props possono rappresentare combinazioni che il prodotto non usa o non supporta. Ogni nuova pagina richiede una modifica al componente centrale.'
});

codeSlide({
  title: 'Dopo: il layout definisce soltanto il guscio', eyebrow: 'children e slot', lang: 'TSX', filename: 'DashboardLayout.tsx',
  code: `type Props = {\\n  sidebar?: React.ReactNode;\\n  footer?: React.ReactNode;\\n  children: React.ReactNode;\\n};\\n\\nexport function DashboardLayout({ sidebar, footer, children }: Props) {\\n  return (\\n    <div className='dashboard-layout'>\\n      {sidebar && <aside>{sidebar}</aside>}\\n      <main>{children}</main>\\n      {footer && <footer>{footer}</footer>}\\n    </div>\\n  );\\n}`,
  bullets: ['Il layout conosce regioni, non feature.', 'Il contenuto viene iniettato dal chiamante.', 'Il contratto resta stabile.'],
  notes: 'DashboardLayout riceve nodi React. sidebar e footer hanno un nome perché rappresentano aree semantiche stabili. children contiene il flusso principale. Il layout può essere testato senza importare TicketList o Reports. L’inversione del controllo evita che il guscio debba conoscere ogni caso d’uso futuro.'
});

codeSlide({
  title: 'Il chiamante compone la pagina nel punto d’uso', eyebrow: 'Composition', lang: 'TSX', filename: 'TicketsPage.tsx',
  code: `export function TicketsPage() {\\n  return (\\n    <DashboardLayout\\n      sidebar={<TicketFilters />}\\n      footer={<Pagination />}\\n    >\\n      <PageHeader title='Tickets' />\\n      <TicketList />\\n    </DashboardLayout>\\n  );\\n}\\n\\n// ReportsPage usa lo stesso guscio con figli diversi.`,
  bullets: ['Nessuna prop mode.', 'Le dipendenze restano nella pagina.', 'Il JSX rappresenta la schermata.'],
  notes: 'La pagina conosce il caso d’uso e crea i componenti specifici. DashboardLayout decide soltanto dove collocarli. Chiedere ai partecipanti di leggere il JSX come una mappa della schermata. Se aggiungiamo ReportsPage, non tocchiamo il layout.'
});

codeSlide({
  title: 'Gli slot nominati descrivono ruoli stabili', eyebrow: 'Contratto del layout', lang: 'TS', filename: 'DashboardLayout.types.ts',
  code: `export type DashboardLayoutProps = {\\n  // Area laterale con filtri o navigazione.\\n  sidebar?: React.ReactNode;\\n\\n  // Contenuto principale: usa children.\\n  children: React.ReactNode;\\n\\n  // Area finale con azioni o paginazione.\\n  footer?: React.ReactNode;\\n};\\n\\n// Evita dieci ReactNode: ricreerebbero un template rigido.`,
  bullets: ['children per il flusso principale.', 'Slot nominato quando il ruolo è semantico.', 'Pochi slot, non una prop per ogni pixel.'],
  notes: 'Children è la prop convenzionale per il contenuto principale. Uno slot nominato è utile quando la posizione ha un significato stabile, come sidebar o footer. Se il componente espone headerLeft, headerRight, beforeTitle, afterTitle e molte altre zone, stiamo ricostruendo un template rigido. In quel caso rivedere il confine.'
});

codeSlide({
  title: 'ReactNode è il contratto più ampio per il contenuto', eyebrow: 'Tipizzazione di children', lang: 'TSX', filename: 'Panel.tsx',
  code: `type PanelProps = {\\n  title: string;\\n  children: React.ReactNode; // testo, elemento, lista, null...\\n};\\n\\nexport function Panel({ title, children }: PanelProps) {\\n  return (\\n    <section aria-labelledby={title}>\\n      <h2 id={title}>{title}</h2>\\n      <div className='panel__body'>{children}</div>\\n    </section>\\n  );\\n}\\n\\n// Usa ReactElement solo se serve un elemento React specifico.`,
  bullets: ['ReactNode accetta ciò che React può renderizzare.', 'Non restringere senza necessità.', 'Il contratto deve riflettere il vero requisito.'],
  notes: 'Spiegare la differenza pratica. ReactNode è adatto alla maggior parte dei contenitori. ReactElement è più stretto e può essere utile quando il componente deve clonare o ispezionare un elemento, operazione comunque da valutare con cautela. La tipizzazione non deve imporre limiti che il componente non usa.'
});

codeSlide({
  title: 'Compound component: API dichiarativa per parti coordinate', eyebrow: 'Tabs', lang: 'TSX', filename: 'TicketsTabs.tsx',
  code: `<Tabs defaultValue='open'>\\n  <Tabs.List aria-label='Stato ticket'>\\n    <Tabs.Trigger value='open'>Aperti</Tabs.Trigger>\\n    <Tabs.Trigger value='closed'>Chiusi</Tabs.Trigger>\\n  </Tabs.List>\\n\\n  <Tabs.Panel value='open'>\\n    <OpenTickets />\\n  </Tabs.Panel>\\n  <Tabs.Panel value='closed'>\\n    <ClosedTickets />\\n  </Tabs.Panel>\\n</Tabs>`,
  bullets: ['Le parti formano un solo widget.', 'Lo stato condiviso resta locale.', 'Il chiamante controlla la struttura.'],
  notes: 'Il pattern compound component è adatto a componenti che collaborano strettamente, come Tabs, Accordion o Menu. L’API è dichiarativa e non richiede di passare activeValue a ogni figlio. Non usarlo per componenti indipendenti, perché il context privato creerebbe un accoppiamento invisibile.'
});

codeSlide({
  title: 'Il componente radice fornisce un Context privato', eyebrow: 'Implementazione compound', lang: 'TSX', filename: 'Tabs/Tabs.tsx',
  code: `type TabsContextValue = {\\n  value: string;\\n  select: (next: string) => void;\\n};\\n\\nconst TabsContext = createContext<TabsContextValue | null>(null);\\n\\nexport function Tabs({ defaultValue, children }: TabsProps) {\\n  const [value, setValue] = useState(defaultValue);\\n\\n  return (\\n    <TabsContext.Provider value={{ value, select: setValue }}>\\n      {children}\\n    </TabsContext.Provider>\\n  );\\n}`,
  bullets: ['Context vicino al widget.', 'Il valore contiene stato e azione.', 'L’API pubblica non espone prop drilling.'],
  notes: 'Il Context è locale alla cartella Tabs e non diventa un contenitore globale. Il provider mantiene lo stato del widget. In un’implementazione completa valuteremmo memoizzazione del value, gestione controlled e accessibilità da tastiera. Qui il punto architetturale è il confine: le parti Tabs condividono una responsabilità unica.'
});

codeSlide({
  title: 'Trigger e Panel consumano il contratto locale', eyebrow: 'Compound children', lang: 'TSX', filename: 'Tabs/parts.tsx',
  code: `function useTabs() {\\n  const context = useContext(TabsContext);\\n  if (!context) throw new Error('Tabs.* must be inside <Tabs>');\\n  return context;\\n}\\n\\nexport function TabsTrigger({ value, children }: TriggerProps) {\\n  const tabs = useTabs();\\n  const selected = tabs.value === value;\\n  return (\\n    <button aria-selected={selected} onClick={() => tabs.select(value)}>\\n      {children}\\n    </button>\\n  );\\n}\\n\\nexport function TabsPanel({ value, children }: PanelProps) {\\n  return useTabs().value === value ? <div role='tabpanel'>{children}</div> : null;\\n}`,
  bullets: ['Il custom hook valida il contesto.', 'Le parti non ricevono activeValue.', 'Il contratto resta confinato al widget.'],
  notes: 'La funzione useTabs centralizza il controllo dell’errore e migliora il messaggio per lo sviluppatore. Trigger e Panel conoscono soltanto il contratto del widget. In produzione aggiungeremmo id, aria-controls, focus management e navigazione con frecce. Questi dettagli restano nella stessa responsabilità.'
});

compareSlide({
  title: 'Non estrarre componenti senza una responsabilità', eyebrow: 'Eccesso di scomposizione', lang: 'TSX',
  leftCode: `function TicketTitle({ text }) {\\n  return <h2>{text}</h2>;\\n}\\n\\nfunction TicketRow({ ticket }) {\\n  return <TicketTitle text={ticket.title} />;\\n}\\n\\n// Un file in più, nessun confine reale.`,
  rightCode: `function TicketRow({ ticket, onSelect }) {\\n  return (\\n    <article onClick={() => onSelect(ticket.id)}>\\n      <h2>{ticket.title}</h2>\\n      <StatusBadge status={ticket.status} />\\n    </article>\\n  );\\n}\\n\\n// StatusBadge possiede un concetto autonomo.`,
  footer: 'Scomporre significa dare un nome a una responsabilità, non nascondere tre righe.',
  notes: 'La lunghezza è un segnale debole. TicketTitle non possiede comportamento, riuso o concetto autonomo. StatusBadge invece può avere mapping, varianti e requisiti di accessibilità propri. L’estrazione deve ridurre il costo di comprendere o modificare il codice, non aumentare la distanza mentale.'
});

codeSlide({
  title: 'La composition rende esplicite le varianti valide', eyebrow: 'Conditional UI', lang: 'TSX', filename: 'TicketPanel.tsx',
  code: `type Props = {\\n  state: 'loading' | 'error' | 'empty' | 'ready';\\n  tickets: Ticket[];\\n};\\n\\nexport function TicketPanel({ state, tickets }: Props) {\\n  if (state === 'loading') return <Spinner />;\\n  if (state === 'error') return <ErrorBanner />;\\n  if (state === 'empty') return <EmptyState />;\\n\\n  // Il ramo ready compone la UI reale.\\n  return (\\n    <Panel>\\n      <TicketList tickets={tickets} />\\n    </Panel>\\n  );\\n}`,
  bullets: ['Una union rappresenta stati validi.', 'I return anticipati riducono nesting.', 'Il ramo ready resta leggibile.'],
  notes: 'Qui la condizione è corretta perché appartiene alla responsabilità del pannello. La union impedisce combinazioni come isLoading e hasError contemporaneamente. Composition non elimina il branching; lo rende coerente con il modello degli stati.'
});

sectionSlide(3, 'Sass e responsabilità', 'Il tema è globale. Il dettaglio grafico appartiene al componente.', 'Collegare la proprietà degli stili al pairing. I token condivisi vivono nel sistema di design; selettori, layout e stati specifici restano vicino al componente.');

codeSlide({
  title: 'Le variabili descrivono decisioni di tema', eyebrow: 'Design tokens', lang: 'SCSS', filename: 'styles/_variables.scss'";
