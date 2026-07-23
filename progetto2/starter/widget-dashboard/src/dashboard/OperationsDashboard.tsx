/**
 * Lo starter concentra intenzionalmente stato, Effect, trasformazioni e UI.
 * L'app funziona al primo avvio. Il brief guida la separazione dei confini.
 */
import { useEffect, useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {
  DashboardWidget,
  OperationsSnapshot,
  TimeRange,
  WidgetKind,
  WidgetSize,
} from './dashboard.types';
import { fetchOperationsSnapshot } from './operationsApi';

const storageKey = 'react-aziendale:widget-dashboard:starter';

const initialWidgets: DashboardWidget[] = [
  {
    id: 'widget-alerts',
    title: 'Criticità aperte',
    kind: 'alerts',
    size: 'compact',
  },
  {
    id: 'widget-sites',
    title: 'Stato delle sedi',
    kind: 'sites',
    size: 'wide',
  },
  {
    id: 'widget-energy',
    title: 'Consumi energetici',
    kind: 'energy',
    size: 'wide',
  },
  {
    id: 'widget-occupancy',
    title: 'Occupazione media',
    kind: 'occupancy',
    size: 'compact',
  },
];

const kindLabels: Record<WidgetKind, string> = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

const healthLabels = {
  regolare: 'Regolare',
  attenzione: 'Attenzione',
  critica: 'Critica',
};

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

type OperationsDashboardProps = {
  loadSnapshot?: (
    range: TimeRange,
    signal: AbortSignal,
  ) => Promise<OperationsSnapshot>;
};

function isWidgetArray(value: unknown): value is DashboardWidget[] {
  if (!Array.isArray(value)) return false;

  const widgetsAreValid = value.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      typeof item.id === 'string' &&
      item.id.trim().length > 0 &&
      'title' in item &&
      typeof item.title === 'string' &&
      item.title.trim().length > 0 &&
      'kind' in item &&
      ['alerts', 'sites', 'energy', 'occupancy'].includes(String(item.kind)) &&
      'size' in item &&
      ['compact', 'wide'].includes(String(item.size)),
  );

  const ids = value.map((widget) => widget.id);
  return widgetsAreValid && new Set(ids).size === ids.length;
}

/** La lettura difensiva impedisce a uno storage corrotto di bloccare l'avvio. */
function readInitialWidgets() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return initialWidgets;
    const parsed: unknown = JSON.parse(saved);
    return isWidgetArray(parsed) ? parsed : initialWidgets;
  } catch {
    return initialWidgets;
  }
}

function createDraft(): DashboardWidget {
  return {
    id: '',
    title: '',
    kind: 'alerts',
    size: 'compact',
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('it-IT').format(value);
}

/** Ogni ramo legge lo stesso snapshot e presenta una vista diversa. */
function WidgetContent({
  widget,
  snapshot,
}: {
  widget: DashboardWidget;
  snapshot: OperationsSnapshot;
}) {
  if (widget.kind === 'alerts') {
    return (
      <Stack spacing={1.5}>
        <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
          {snapshot.alerts.length}
        </Typography>
        <Typography color="text.secondary">segnalazioni da gestire</Typography>
        <List dense disablePadding aria-label="Ultime criticità">
          {snapshot.alerts.slice(0, 2).map((alert) => (
            <ListItem key={alert.id} disableGutters>
              <ListItemText
                primary={alert.title}
                secondary={alert.severity === 'alta' ? 'Priorità alta' : 'Priorità media'}
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  }

  if (widget.kind === 'sites') {
    return (
      <List disablePadding aria-label="Stato delle sedi">
        {snapshot.sites.map((site) => (
          <ListItem
            key={site.id}
            disableGutters
            secondaryAction={
              <Chip
                size="small"
                label={healthLabels[site.health]}
                color={
                  site.health === 'critica'
                    ? 'error'
                    : site.health === 'attenzione'
                      ? 'warning'
                      : 'default'
                }
              />
            }
          >
            <ListItemText primary={site.name} secondary={site.city} />
          </ListItem>
        ))}
      </List>
    );
  }

  if (widget.kind === 'energy') {
    const total = snapshot.sites.reduce(
      (sum, site) => sum + site.energyKwh,
      0,
    );
    const max = Math.max(...snapshot.sites.map((site) => site.energyKwh), 1);

    return (
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 700 }}>
            {formatNumber(total)} kWh
          </Typography>
          <Typography color="text.secondary">totale delle sedi</Typography>
        </Box>
        {snapshot.sites.map((site) => (
          <Box key={site.id}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">{site.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatNumber(site.energyKwh)} kWh
              </Typography>
            </Stack>
            <LinearProgress
              aria-label={`Consumo ${site.name}`}
              variant="determinate"
              value={(site.energyKwh / max) * 100}
              sx={{ mt: 0.75, height: 7, borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

  const average = Math.round(
    snapshot.sites.reduce((sum, site) => sum + site.occupancy, 0) /
      Math.max(snapshot.sites.length, 1),
  );

  return (
    <Stack spacing={2}>
      <GroupsIcon color="primary" sx={{ fontSize: 32 }} aria-hidden="true" />
      <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
        {average}%
      </Typography>
      <Typography color="text.secondary">media sulle sedi attive</Typography>
      <LinearProgress
        aria-label="Occupazione media"
        variant="determinate"
        value={average}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Stack>
  );
}

export function OperationsDashboard({
  loadSnapshot = fetchOperationsSnapshot,
}: OperationsDashboardProps) {
  // Stato persistente, globale, server e UI sono ancora nello stesso componente.
  const [widgets, setWidgets] = useState(readInitialWidgets);
  const [range, setRange] = useState<TimeRange>('oggi');
  const [query, setQuery] = useState('');
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<DashboardWidget>(createDraft);
  const [widgetToDelete, setWidgetToDelete] =
    useState<DashboardWidget | null>(null);
  const previousRange = useRef(range);
  const createWidgetButtonRef = useRef<HTMLButtonElement>(null);
  const focusCreateAfterDelete = useRef(false);

  // Questo Effect sincronizza la configurazione con una risorsa del browser.
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(widgets));
    } catch {
      // Lo starter resta utilizzabile anche quando lo storage non è disponibile.
    }
  }, [widgets]);

  // Questo Effect sincronizza intervallo e richiesta API e annulla quella obsoleta.
  useEffect(() => {
    const controller = new AbortController();
    const rangeChanged = previousRange.current !== range;
    previousRange.current = range;
    setLoadStatus('loading');
    setError(null);
    if (rangeChanged) setSnapshot(null);

    loadSnapshot(range, controller.signal)
      .then((nextSnapshot) => {
        setSnapshot(nextSnapshot);
        setLoadStatus('success');
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') {
          return;
        }

        setError(
          reason instanceof Error
            ? reason.message
            : 'Errore imprevisto durante il caricamento.',
        );
        setLoadStatus('error');
      });

    return () => controller.abort();
  }, [loadSnapshot, range, retryToken]);

  // La lista visibile è derived state. Non serve un altro useState.
  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');
  const visibleWidgets = widgets.filter((widget) =>
    [widget.title, kindLabels[widget.kind]]
      .join(' ')
      .toLocaleLowerCase('it-IT')
      .includes(normalizedQuery),
  );

  function openCreateDialog() {
    setDraft(createDraft());
    setDialogOpen(true);
  }

  function openEditDialog(widget: DashboardWidget) {
    setDraft({ ...widget });
    setDialogOpen(true);
  }

  function saveWidget() {
    const title = draft.title.trim();
    if (!title) return;

    if (draft.id) {
      setWidgets((current) =>
        current.map((widget) =>
          widget.id === draft.id ? { ...draft, title } : widget,
        ),
      );
    } else {
      setWidgets((current) => [
        ...current,
        { ...draft, id: `widget-${crypto.randomUUID()}`, title },
      ]);
    }

    setDialogOpen(false);
  }

  function deleteWidget() {
    if (!widgetToDelete) return;
    setWidgets((current) =>
      current.filter((widget) => widget.id !== widgetToDelete.id),
    );
    setWidgetToDelete(null);
  }

  function moveWidget(widgetId: string, offset: -1 | 1) {
    setWidgets((current) => {
      const from = current.findIndex((widget) => widget.id === widgetId);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= current.length) return current;

      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <DashboardCustomizeIcon aria-hidden="true" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>Centrale Operativa</Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              Monitoraggio sedi aziendali
            </Typography>
          </Box>
          <Chip
            label="Ambiente didattico"
            size="small"
            sx={{
              color: 'grey.100',
              borderColor: 'grey.600',
              display: { xs: 'none', sm: 'flex' },
            }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {loadStatus === 'loading' && snapshot ? (
        <LinearProgress aria-label="Aggiornamento dati" />
      ) : null}

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-end' },
            mb: 4,
          }}
        >
          <Box>
            <Typography component="h1" variant="h1">
              Dashboard a widget
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              Componi la vista operativa, controlla le sedi e intervieni sulle
              criticità senza perdere il contesto.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="range-label">Intervallo</InputLabel>
              <Select
                labelId="range-label"
                label="Intervallo"
                value={range}
                onChange={(event) => setRange(event.target.value as TimeRange)}
              >
                <MenuItem value="oggi">Oggi</MenuItem>
                <MenuItem value="7-giorni">Ultimi 7 giorni</MenuItem>
                <MenuItem value="30-giorni">Ultimi 30 giorni</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setRetryToken((value) => value + 1)}
            >
              Aggiorna dati
            </Button>
            <Button
              ref={createWidgetButtonRef}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Crea widget
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <TextField
              label="Cerca widget"
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ flexGrow: 1, maxWidth: { sm: 420 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon aria-hidden="true" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography color="text.secondary" aria-live="polite">
              {`${visibleWidgets.length} ${
                visibleWidgets.length === 1 ? 'widget visibile' : 'widget visibili'
              }`}
            </Typography>
          </Stack>
        </Paper>

        {loadStatus === 'loading' && !snapshot ? (
          <Box
            role="status"
            aria-label="Caricamento dashboard"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={220} />
            ))}
          </Box>
        ) : null}

        {loadStatus === 'error' ? (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            action={
              <Button color="inherit" onClick={() => setRetryToken((value) => value + 1)}>
                Riprova
              </Button>
            }
          >
            <Typography sx={{ fontWeight: 700 }}>Dati non disponibili</Typography>
            {error}
          </Alert>
        ) : null}

        {loadStatus === 'success' && snapshot?.sites.length === 0 ? (
          <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
            <BusinessIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
            <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
              Nessuna sede disponibile
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aggiorna i dati oppure verifica la sorgente API.
            </Typography>
          </Paper>
        ) : null}

        {snapshot && snapshot.sites.length > 0 ? (
          widgets.length === 0 ? (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <DashboardCustomizeIcon
                color="primary"
                sx={{ fontSize: 40 }}
                aria-hidden="true"
              />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget configurato
              </Typography>
              <Button sx={{ mt: 2 }} onClick={openCreateDialog}>
                Crea il primo widget
              </Button>
            </Paper>
          ) : visibleWidgets.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {visibleWidgets.map((widget) => {
                const position = widgets.findIndex((item) => item.id === widget.id);
                return (
                  <Card
                    component="article"
                    key={widget.id}
                    variant="outlined"
                    sx={{
                      gridColumn: { lg: widget.size === 'wide' ? 'span 2' : 'span 1' },
                      minWidth: 0,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        sx={{ alignItems: 'flex-start', mb: 2.5 }}
                      >
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography component="h2" variant="h2">
                            {widget.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {kindLabels[widget.kind]}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={0.25}
                          sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
                        >
                          <Tooltip title="Sposta prima">
                            <span>
                              <IconButton
                                size="small"
                                aria-label={`Sposta prima ${widget.title}`}
                                disabled={position === 0}
                                onClick={() => moveWidget(widget.id, -1)}
                              >
                                <ArrowUpwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Sposta dopo">
                            <span>
                              <IconButton
                                size="small"
                                aria-label={`Sposta dopo ${widget.title}`}
                                disabled={position === widgets.length - 1}
                                onClick={() => moveWidget(widget.id, 1)}
                              >
                                <ArrowDownwardIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Modifica">
                            <IconButton
                              size="small"
                              aria-label={`Modifica ${widget.title}`}
                              onClick={() => openEditDialog(widget)}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Elimina">
                            <IconButton
                              size="small"
                              aria-label={`Elimina ${widget.title}`}
                              onClick={() => setWidgetToDelete(widget)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                      <WidgetContent widget={widget} snapshot={snapshot} />
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <SearchIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget corrisponde alla ricerca
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setQuery('')}>
                Reimposta ricerca
              </Button>
            </Paper>
          )
        ) : null}

        {snapshot ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 3 }}
          >
            Dati aggiornati il{' '}
            {new Intl.DateTimeFormat('it-IT', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(snapshot.updatedAt))}
          </Typography>
        ) : null}
      </Container>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            saveWidget();
          }}
        >
          <DialogTitle>{draft.id ? 'Modifica widget' : 'Crea widget'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                required
                label="Titolo"
                slotProps={{ htmlInput: { 'aria-label': 'Titolo' } }}
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                helperText="Usa un titolo che descriva il dato mostrato."
              />
              <FormControl>
                <InputLabel id="widget-kind-label">Tipo di widget</InputLabel>
                <Select
                  labelId="widget-kind-label"
                  label="Tipo di widget"
                  value={draft.kind}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      kind: event.target.value as WidgetKind,
                    }))
                  }
                >
                  {Object.entries(kindLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="widget-size-label">Dimensione</InputLabel>
                <Select
                  labelId="widget-size-label"
                  label="Dimensione"
                  value={draft.size}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      size: event.target.value as WidgetSize,
                    }))
                  }
                >
                  <MenuItem value="compact">Compatto</MenuItem>
                  <MenuItem value="wide">Esteso</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Annulla</Button>
            <Button type="submit" variant="contained" disabled={!draft.title.trim()}>
              Salva widget
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(widgetToDelete)}
        onClose={() => setWidgetToDelete(null)}
        slotProps={{
          transition: {
            onExited: () => {
              if (!focusCreateAfterDelete.current) return;
              focusCreateAfterDelete.current = false;
              createWidgetButtonRef.current?.focus();
            },
          },
        }}
      >
        <DialogTitle>Eliminare il widget?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {widgetToDelete
              ? `Il widget "${widgetToDelete.title}" verrà rimosso dalla dashboard.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetToDelete(null)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              focusCreateAfterDelete.current = true;
              deleteWidget();
            }}
          >
            Elimina widget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
