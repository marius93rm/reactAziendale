module.exports = "Value(query, 400);\\n  const [state, setState] = useState<TicketsState>(INITIAL_STATE);\\n\\n  useEffect(() => {\\n    if (!debouncedQuery.trim()) {\\n      setState(INITIAL_STATE);\\n      return;\\n    }\\n\\n    const controller = new AbortController();\\n    setState(current => ({ ...current, status: 'loading', error: null }));\\n\\n    fetchTickets(debouncedQuery, controller.signal)\\n      .then(data => setState({ status: 'success', data, error: null }))\\n      .catch(error => {\\n        if (error.name !== 'AbortError')\\n          setState({ status: 'error', data: [], error });\\n      });\\n\\n    return () => controller.abort();\\n  }, [debouncedQuery]);\\n\\n  return state;\\n}`,
  bullets: ['Input immediato, query debounced.', 'Una richiesta attiva per volta.', 'Stati asincroni modellati in un unico oggetto.'],
  notes: 'Questo è il cuore del laboratorio. useDebouncedValue gestisce il tempo. L’Effect di useTickets gestisce la sincronizzazione di rete. AbortController annulla la richiesta precedente. Lo stato potrebbe essere modellato anche con useReducer nel Modulo 2; qui usiamo un oggetto per mantenere gli stati coerenti.'
});

codeSlide({
  title: 'SearchField possiede soltanto l’input immediato', eyebrow: 'Presentational input', lang: 'TSX', filename: 'SearchField.tsx',
  code: `type Props = {\\n  value: string;\\n  onChange: (value: string) => void;\\n};\\n\\nexport function SearchField({ value, onChange }: Props) {\\n  return (\\n    <label className='search-field'>\\n      <span>Cerca ticket</span>\\n      <input\\n        type='search'\\n        value={value}\\n        onChange={event => onChange(event.target.value)}\\n        placeholder='ID, titolo o cliente'\\n      />\\n    </label>\\n  );\\n}\\n\\n// Nessun timer e nessuna fetch nel componente.`,
  bullets: ['Controlled input semplice.', 'Il valore cambia a ogni carattere.', 'La semantica label resta nel componente.'],
  notes: 'SearchField non deve conoscere il debounce. Il suo contratto è value e onChange. Questo lo rende riusabile e immediato: la UI riflette ogni carattere, mentre la rete segue il valore debounced nel hook. Separare input state e server synchronization evita una sensazione di input lento.'
});

codeSlide({
  title: 'TicketsPage riunisce il flusso senza nascondere le parti', eyebrow: 'Integrazione finale', lang: 'TSX', filename: 'TicketsPage.tsx',
  code: `export function TicketsPage() {\\n  const [query, setQuery] = useState('');\\n  const tickets = useTickets(query);\\n\\n  return (\\n    <DashboardLayout sidebar={<TicketFilters />}>\\n      <SearchField value={query} onChange={setQuery} />\\n\\n      {tickets.status === 'loading' && <Spinner />}\\n      {tickets.status === 'error' && (\\n        <ErrorBanner error={tickets.error} />\\n      )}\\n      {tickets.status === 'success' && (\\n        <TicketList tickets={tickets.data} />\\n      )}\\n    </DashboardLayout>\\n  );\\n}`,
  bullets: ['Evento → state → debounce → fetch → UI.', 'La page orchestra stati e componenti.', 'Ogni confine resta visibile nel JSX.'],
  notes: 'Leggere il flusso completo. SearchField produce il valore immediato. useTickets lo debounce, avvia la fetch e annulla quella obsoleta. TicketsPage renderizza lo stato asincrono. Una variante più avanzata potrebbe incapsulare loading/error/empty in una view dedicata, ma il flusso deve restare leggibile.'
});

codeSlide({
  title: 'Strict Mode verifica la simmetria del processo', eyebrow: 'Sviluppo', lang: 'TSX', filename: 'TicketChannel.tsx',
  code: `useEffect(() => {\\n  const connection = createConnection(ticketId);\\n  connection.connect();\\n\\n  return () => {\\n    connection.disconnect();\\n  };\\n}, [ticketId]);\\n\\n// In sviluppo con Strict Mode:\\n// setup → cleanup → setup reale\\n\\n// Non bloccare il secondo setup con un ref.\\n// Correggi invece la cleanup incompleta.`,
  bullets: ['Il ciclo extra avviene in sviluppo.', 'Serve a far emergere processi non simmetrici.', 'La produzione usa il ciclo normale.'],
  notes: 'React esegue un ciclo setup-cleanup-setup aggiuntivo in sviluppo per verificare che la cleanup annulli davvero il setup. Non va aggirato con un ref che impedisce il secondo setup, perché questo nasconde il problema. Se la UI differisce, il processo non è idempotente o la cleanup è incompleta.'
});

// Lab and checklist
conceptSlide({
  title: 'Laboratorio: rifattorizzare la ricerca ticket', eyebrow: 'Consegna operativa',
  definition: 'Partire da una pagina monolitica e ottenere feature, componenti, hook, service e cleanup verificabile.',
  example: 'stesso comportamento → confini più chiari',
  bullets: ['Pairing TSX + SCSS', 'DashboardLayout con slot', 'useDebouncedValue a 400 ms', 'AbortController e stati UI'],
  notes: 'Concedere circa 35-45 minuti. I partecipanti partono da un componente che esegue fetch a ogni carattere e contiene filtri, lista e stato. Chiedere prima un disegno dei confini, poi il codice. La verifica include il pannello Network, Strict Mode e una breve code review in cui motivano almeno una scelta e un’alternativa scartata.'
});

slideNo++;
{
  const slide = pptx.addSlide();
  addBackground(slide, 'CHECKLIST');
  addTitle(slide, 'Checklist finale del code lab', 'Prima della pull request');
  const groups = [
    { title: 'ARCHITETTURA', color: C.accent2, items: ['File che cambiano insieme sono vicini', 'Shared contiene riuso provato', 'Import rispettano i confini'] },
    { title: 'COMPONENTI', color: C.green, items: ['Props descrivono un contratto piccolo', 'Composition evita modalità crescenti', 'Hook isola una responsabilità'] },
    { title: 'RUNTIME', color: C.yellow, items: ['State non viene mutato', 'Key segue l’entità corretta', 'Ogni Effect possiede cleanup'] },
  ];
  groups.forEach((g, idx) => {
    const x = 0.58 + idx*4.16;
    slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.78, w: 3.78, h: 4.85, rectRadius: 0.06, fill: { color: C.surface }, line: { color: C.line, width: 1 } });
    slide.addText(g.title, { x: x+0.28, y: 2.08, w: 3.2, h: 0.23, fontFace: FONT, fontSize: 11, bold: true, charSpacing: 1.2, color: g.color, margin: 0 });
    let yy = 2.72;
    g.items.forEach(item => {
      slide.addShape(pptx.ShapeType.roundRect, { x: x+0.28, y: yy, w: 0.32, h: 0.32, rectRadius: 0.04, fill: { color: g.color, transparency: 78 }, line: { color: g.color, width: 0.8 } });
      slide.addText('✓', { x: x+0.34, y: yy+0.045, w: 0.2, h: 0.17, fontFace: FONT, fontSize: 10, bold: true, color: g.color, margin: 0, align: 'center' });
      slide.addText(item, { x: x+0.76, y: yy-0.02, w: 2.66, h: 0.64, fontFace: FONT, fontSize: 15.2, color: C.text, margin: 0, fit: 'shrink' });
      yy += 1.02;
    });
  });
  addNotes(slide, 'Usare la checklist come strumento di review, non come dogma. Ogni voce deve essere sostenuta da un esempio nel codice. Una scelta diversa può essere corretta se risponde meglio a un vincolo reale e viene documentata. L’obiettivo è rendere le decisioni discutibili e verificabili dal team.');
}

slideNo++;
{
  const slide = pptx.addSlide();
  addBackground(slide, 'FONTI');
  addTitle(slide, 'Fonti e approfondimenti', 'Riferimenti primari');
  const sources = [
    ['React', 'State as a Snapshot · Queueing State Updates · Preserving and Resetting State'],
    ['React', 'Synchronizing with Effects · Lifecycle of Reactive Effects · useEffect'],
    ['React source', 'packages/react-reconciler/src/ReactFiberHooks.js'],
    ['Sass', '@use · Variables · Modules'],
    ['MDN', 'AbortController · setTimeout · addEventListener'],
    ['Corso', 'Programma React aziendale e presentazione teorica del Modulo 1'],
  ];
  let yy=1.8;
  sources.forEach(([name, desc], i) => {
    slide.addText(String(i+1).padStart(2,'0'), { x: 0.72, y: yy+0.03, w: 0.48, h: 0.22, fontFace: MONO, fontSize: 11, bold: true, color: C.accent2, margin: 0 });
    slide.addText(name, { x: 1.35, y: yy, w: 2.0, h: 0.3, fontFace: FONT, fontSize: 15.5, bold: true, color: C.text, margin: 0 });
    slide.addText(desc, { x: 3.45, y: yy, w: 8.5, h: 0.42, fontFace: FONT, fontSize: 14, color: C.muted, margin: 0, fit: 'shrink' });
    slide.addShape(pptx.ShapeType.line, { x: 1.35, y: yy+0.57, w: 10.7, h: 0, line: { color: C.line, width: 0.8 } });
    yy += 0.78;
  });
  slide.addText('URL principali nelle note del presentatore e nella presentazione teorica.', { x: 1.35, y: 6.65, w: 8.9, h: 0.24, fontFace: FONT, fontSize: 11.5, bold: true, color: C.green, margin: 0 });
  addNotes(slide, 'Riferimenti principali: https://react.dev/learn/state-as-a-snapshot ; https://react.dev/learn/queueing-a-series-of-state-updates ; https://react.dev/learn/preserving-and-resetting-state ; https://react.dev/learn/synchronizing-with-effects ; https://react.dev/learn/lifecycle-of-reactive-effects ; https://react.dev/reference/react/useEffect ; https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.js ; https://sass-lang.com/documentation/at-rules/use/ ; https://developer.mozilla.org/en-US/docs/Web/API/AbortController .');
}

slideNo++;
{
  const slide = pptx.addSlide();
  slide.background = { color: C.bg };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: SW, h: 0.18, fill: { color: C.accent }, line: { color: C.accent } });
  slide.addText('UNA BUONA ARCHITETTURA RENDE PREVEDIBILE IL CAMBIAMENTO', { x: 0.85, y: 1.05, w: 11.65, h: 0.35, fontFace: FONT, fontSize: 12, bold: true, charSpacing: 1.6, color: C.accent2, margin: 0, align: 'center' });
  slide.addText('Il team sa dove intervenire.\\nReact sa che cosa conservare.\\nOgni Effect sa che cosa fermare.', { x: 1.25, y: 2.0, w: 10.85, h: 2.35, fontFace: 'Aptos Display', fontSize: 35, bold: true, color: C.text, margin: 0, align: 'center', valign: 'mid', fit: 'shrink' });
  slide.addShape(pptx.ShapeType.line, { x: 3.9, y: 5.15, w: 5.55, h: 0, line: { color: C.line, width: 1.2 } });
  slide.addText('MODULO 1 · CODE LAB COMPLETATO', { x: 3.7, y: 5.55, w: 5.95, h: 0.3, fontFace: MONO, fontSize: 12, bold: true, color: C.green, margin: 0, a";
